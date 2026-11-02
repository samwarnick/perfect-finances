import type { Budget, Transaction } from './db/schema';
import type { Stats } from '../types';
import { getPastBudgetMonths } from './budgets';
import { getTransactionsForMonth } from './transactions';
import { monthLabel } from './months';
import { statsForClosedMonth } from './stats';

export type MonthHistory = {
	month: string;
	label: string;
	budget: Budget;
	stats: Stats;
	transactions: Transaction[];
};

export async function getHistory(limit?: number): Promise<MonthHistory[]> {
	const months = await getPastBudgetMonths(limit);

	return Promise.all(
		months.map(async (budget) => {
			const transactions = await getTransactionsForMonth(budget.month);

			return {
				month: budget.month,
				label: monthLabel(budget.month),
				budget,
				stats: statsForClosedMonth(budget, transactions, budget.month),
				transactions,
			};
		}),
	);
}
