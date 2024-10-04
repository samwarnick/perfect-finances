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
	const budget = (await db.select().from(budgets))[0];
	const today = DateTime.now().toFormat('yyyy-MM-dd hh:mm:ss');
	const thirtyDaysAgo = DateTime.now()
		.minus({ days: 30 })
		.toFormat('yyyy-MM-dd hh:mm:ss');
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
	const lastThirtyDaysTransactions = await db
		.select()
		.from(transactions)
		.where(
			and(
				gte(transactions.createdAt, thirtyDaysAgo),
				lte(transactions.createdAt, today),
			),
		);

	const stats = calcStats(
		budget,
		thisMonthsTransactions,
		lastThirtyDaysTransactions,
	);

	return c.html(
		<Layout>
			<article id="details">
				<div class="grid">
					<div>
						<strong>{formatAmount(stats.currentBalance)} Remaining</strong>
					</div>
					<div style="text-align: right">
						<span>{formatAmount(stats.spentSoFar)} Spent</span>
					</div>
				</div>
				<progress value={stats.percentRemaining} max="100" />
				<details>
					<ul>
						<li>
							Avg daily spend: {formatAmount(stats.avgDailySpend)}{' '}
							<small>
								({stats.avgDailySpend > 7525 ? 'Above' : 'Below'} target of
								$75.25)
							</small>
						</li>
						<li>
							Last 30 days svg spend:{' '}
							{formatAmount(stats.lastThirtyAvgDailySpend)}
						</li>
						<li>Projected balance: {formatAmount(stats.projectedBalance)}</li>
						<li>
							Could mean and extra {formatAmount(stats.projectedReward)} in fun
							money and {formatAmount(stats.projectedSavings)} more saved!
						</li>
					</ul>
				</details>
			</article>

			<form hx-post="/" hx-target="#details">
				<label>
					How much did you spend today?
					<fieldset role="group">
						<input
							name="amount"
							type="number"
							placeholder="100.00"
							step="any"
						/>
						<input type="submit" value="Submit" />
					</fieldset>
				</label>
			</form>
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
		return c.html(<span id="amountLeft">{formatAmount(budget.amount)}</span>);
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
