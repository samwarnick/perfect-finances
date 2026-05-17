import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db/db';
import { budgets, transactions } from '../db/schema';
import { calcStats, calcStatsForTransactions } from '../utils/stats';
import {
	getLastMonthsTransactions,
	getThisMonthsTransactions,
} from '../utils/transactions';

const app = new Hono();

app.post(
	'/transaction',
	zValidator(
		'json',
		z.object({ amount: z.coerce.number(), notes: z.string() }),
	),
	async (c) => {
		const budget = (await db.select().from(budgets))[0];
		const { amount, notes } = c.req.valid('json');
		const amountInCents = amount * 100;
		await db.insert(transactions).values([
			{
				amount: amountInCents,
				notes,
				budget: budget.id,
			},
		]);
		const stats = await calcStats();
		return c.json(stats);
	},
);

app.get('/transactions', async (c) => {
	const thisMonthsTransactions = await getThisMonthsTransactions();
	return c.json(thisMonthsTransactions);
});

app.get('/stats', async (c) => {
	const stats = await calcStats();
	return c.json(stats);
});

app.get('/stats/all', async (c) => {
	const currentMonth = await calcStats();
	const lastMonthsTransactions = await getLastMonthsTransactions();
	const lastMonth = await calcStatsForTransactions(lastMonthsTransactions);
	return c.json({ currentMonth, lastMonth });
});

export default app;
