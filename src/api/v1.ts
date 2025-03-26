import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db/db';
import { budgets, transactions } from '../db/schema';
import { calcStats } from '../utils/stats';

const app = new Hono<{Variables: {username: string}}>();

app.post('/transaction', zValidator(
	'json',
	z.object({ amount: z.coerce.number(), notes: z.string() }),
), async (c) => {
	const budget = (await db.select().from(budgets))[0];
	const { amount, notes } = c.req.valid('json');
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
	return c.json(stats);
});

app.get('/stats', async (c) => {
	const stats = await calcStats();
	return c.json(stats);
})

export default app;