import { z } from 'zod';
import { getDb } from '#lib/server/db/db.js';
import { transactions } from '#lib/server/db/schema.js';
import { ensureBudgetForMonth } from '#lib/server/budgets.js';
import { currentMonth } from '#lib/server/months.js';
import { calcCurrentMonthStats } from '#lib/server/stats.js';
import type { RequestHandler } from './$types';

const addTransactionSchema = z.object({
	amount: z.coerce.number(),
	notes: z.string(),
});

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const result = addTransactionSchema.safeParse(body);

	if (!result.success) {
		return Response.json(
			{ error: 'Invalid request body', issues: result.error.issues },
			{ status: 400 },
		);
	}

	const budget = await ensureBudgetForMonth(currentMonth());
	const { amount, notes } = result.data;

	await getDb()
		.insert(transactions)
		.values([
			{
				amount: Math.round(amount * 100),
				notes,
				budget: budget.id,
			},
		]);

	return Response.json(await calcCurrentMonthStats());
};
