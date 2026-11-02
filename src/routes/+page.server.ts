import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getDb } from '#lib/server/db/db.js';
import { transactions } from '#lib/server/db/schema.js';
import { ensureBudgetForMonth } from '#lib/server/budgets.js';
import { currentMonth } from '#lib/server/months.js';
import { calcCurrentMonthStats } from '#lib/server/stats.js';
import {
	deleteTransactionAction,
	updateAmountAction,
	updateNotesAction,
} from '#lib/server/transaction-actions.js';
import { getTransactionsForMonth } from '#lib/server/transactions.js';
import { parseForm } from '#lib/server/validation.js';
import type { Actions, PageServerLoad } from './$types';

const addTransactionSchema = z.object({
	amount: z.coerce.number(),
	notes: z.string(),
});

export const load: PageServerLoad = async () => {
	const month = currentMonth();
	const [stats, monthTransactions] = await Promise.all([
		calcCurrentMonthStats(),
		getTransactionsForMonth(month),
	]);

	return {
		stats,
		recent: monthTransactions.slice(0, 4),
	};
};

export const actions = {
	add: async ({ request }) => {
		const result = parseForm(addTransactionSchema, await request.formData());

		if (!result.success) {
			return fail(400, { issues: result.issues });
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
	},

	deleteTransaction: deleteTransactionAction,
	updateAmount: updateAmountAction,
	updateNotes: updateNotesAction,
} satisfies Actions;
