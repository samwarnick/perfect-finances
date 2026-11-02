import { getHistory } from '#lib/server/history.js';
import { getBudgetForMonth } from '#lib/server/budgets.js';
import { currentMonth } from '#lib/server/months.js';
import {
	deleteTransactionAction,
	updateAmountAction,
	updateNotesAction,
} from '#lib/server/transaction-actions.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const months = await getHistory(6);
	const current = await getBudgetForMonth(currentMonth());
	const fallbackTarget = months[0]?.budget.dailyTarget ?? 0;

	return {
		months,
		target:
			current && current.dailyTarget > 0 ? current.dailyTarget : fallbackTarget,
	};
};

export const actions = {
	deleteTransaction: deleteTransactionAction,
	updateAmount: updateAmountAction,
	updateNotes: updateNotesAction,
} satisfies Actions;
