import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import { db } from './db/db';
import { Layout } from './layout';
import { performMigration } from './db/migrate';
import { basicAuth } from 'hono/basic-auth';
import { budgets, transactions } from './db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { calcStats } from './utils/stats';
import { Form } from './components/form';
import { Details } from './components/details';
import { Transactions } from './components/transactions';
import { getThisMonthsTransactions } from './utils/transactions';

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
		</Layout>,
	);
});

app.post(
	'/',
	zValidator(
		'form',
		z.object({ amount: z.coerce.number(), notes: z.string() }),
	),
	async (c) => {
		const budget = (await db.select().from(budgets))[0];
		const { amount, notes } = c.req.valid('form');
		const amountInCents = amount * 100;
		await db.insert(transactions).values([
			{
				amount: amountInCents,
				notes,
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
	const thisMonthsTransactions = await getThisMonthsTransactions();

	return c.html(
		<Layout>
			<article>
				<form
					hx-patch="/manage/budget"
					hx-target="#budgetAmount"
					hx-swap="outerHTML"
				>
					<label>
						Budget
						<input
							name="amount"
							type="number"
							placeholder="100.00"
							step="any"
							id="budgetAmount"
							value={(budget.amount / 100).toFixed(2)}
						/>
					</label>
					<label>
						Daily Target
						<input
							name="dailyTarget"
							type="number"
							placeholder="100.00"
							step="any"
							id="dailyTarget"
							value={(budget.dailyTarget / 100).toFixed(2)}
						/>
					</label>
					<input type="submit" value="Update" />
				</form>
			</article>
			<Transactions transactions={thisMonthsTransactions} />
		</Layout>,
	);
});

app.patch(
	'/manage/budget',
	zValidator(
		'form',
		z.object({ amount: z.coerce.number(), dailyTarget: z.coerce.number() }),
	),
	async (c) => {
		const { amount, dailyTarget } = c.req.valid('form');
		const amountInCents = amount * 100;
		const dailyTargetInCents = dailyTarget * 100;
		const budget = (await db.select().from(budgets))[0];
		await db
			.update(budgets)
			.set({ amount: amountInCents, dailyTarget: dailyTargetInCents })
			.where(eq(budgets.id, budget.id));
		return c.html(
			<input
				name="amount"
				type="number"
				placeholder="100.00"
				step="any"
				id="budgetAmount"
				value={(amountInCents / 100).toFixed(2)}
			/>,
		);
	},
);

app.delete(
	'/manage/transaction/:id',
	zValidator('param', z.object({ id: z.coerce.number() })),
	async (c) => {
		const { id } = c.req.valid('param');
		await db.delete(transactions).where(eq(transactions.id, id));
		const thisMonthsTransactions = await getThisMonthsTransactions();
		return c.html(<Transactions transactions={thisMonthsTransactions} />);
	},
);

performMigration();

export default app;
