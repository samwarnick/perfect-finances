import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import { db } from './db/db';
import { Layout } from './layout';
import { performMigration } from './db/migrate';
import { basicAuth } from 'hono/basic-auth';
import { budgets, transactions } from './db/schema';
import { formatAmount } from './utils/format';
import { and, eq, gte, lte } from 'drizzle-orm';
import { z } from 'zod';
import { DateTime } from 'luxon';
import { calcStats } from './utils/stats';
import { Form } from './components/form';
import { Details } from './components/details';

type Variables = {
	username: string;
};

const app = new Hono<{ Variables: Variables }>();

app.use(logger());

app.use(
	'/assets/*',
	serveStatic({
		root: './',
		rewriteRequestPath: (path) => path.replace(/^\/assets/, '/src/assets'),
	}),
);

app.use(
	'*',
	basicAuth({
		verifyUser: (username, password, c) => {
			const usernames = Bun.env.USERNAMES.split(',');
			const valid =
				usernames.includes(username) && password === Bun.env.PASSWORD;
			if (valid) {
				c.set('username', username);
			}
			return valid;
		},
	}),
);

app.get('/', async (c) => {
	const stats = await calcStats();

	return c.html(
		<Layout>
			<Details {...stats} />
			<Form />
			<a href="/manage">Manage Budget</a>
		</Layout>,
	);
});

app.post(
	'/',
	zValidator('form', z.object({ amount: z.coerce.number() })),
	async (c) => {
		const budget = (await db.select().from(budgets))[0];
		const { amount } = c.req.valid('form');
		const amountInCents = amount * 100;
		await db.insert(transactions).values([
			{
				amount: amountInCents,
				budget: budget.id,
				user: c.get('username'),
			},
		]);
		const stats = await calcStats();
		return c.html(<Details {...stats} />);
	},
);

app.get('/manage', async (c) => {
	const budget = (await db.select().from(budgets))[0];
	const startOfMonth = DateTime.now()
		.startOf('month')
		.toFormat('yyyy-MM-dd hh:mm:ss');
	const endOfMonth = DateTime.now()
		.endOf('month')
		.toFormat('yyyy-MM-dd hh:mm:ss');

	const thisMonthsTransactions = await db
		.select()
		.from(transactions)
		.where(
			and(
				gte(transactions.createdAt, startOfMonth),
				lte(transactions.createdAt, endOfMonth),
			),
		);

	return c.html(
		<Layout>
			<article>
				<form action="">
					<label>
						Budget
						<fieldset role="group">
							<input
								name="amount"
								type="number"
								placeholder="100.00"
								step="any"
								value={budget.amount}
							/>
							<input type="submit" value="Update" />
						</fieldset>
					</label>
				</form>
			</article>
			<article>
				<ul>
					{thisMonthsTransactions.map((t) => (
						<li>{formatAmount(t.amount)}</li>
					))}
				</ul>
			</article>
		</Layout>,
	);
});

performMigration();

export default app;
