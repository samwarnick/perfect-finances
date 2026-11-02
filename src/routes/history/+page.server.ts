import { getHistory } from '#lib/server/history.js';
import {
	deleteTransactionAction,
	updateAmountAction,
	updateNotesAction,
} from '#lib/server/transaction-actions.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { months: await getHistory(6) };
};

export const actions = {
	deleteTransaction: deleteTransactionAction,
	updateAmount: updateAmountAction,
	updateNotes: updateNotesAction,
} satisfies Actions;
