import type { Budget, Transaction } from './db/schema';
import type { Stats } from '../types';
import { ensureBudgetForMonth, getBudgetForMonth } from './budgets';
import {
	getLastThirtyDaysTransactions,
	getTransactionsForMonth,
} from './transactions';
import {
	currentMonth,
	daysElapsedInMonth,
	daysInMonth,
	daysLeftInMonth,
} from './months';

/** Stats for the month in progress: projects the rest of the month. */
export async function calcCurrentMonthStats(): Promise<Stats> {
	const month = currentMonth();
	const budget = await ensureBudgetForMonth(month);
	const [transactions, lastThirtyDays] = await Promise.all([
		getTransactionsForMonth(month),
		getLastThirtyDaysTransactions(),
	]);

	const stats = computeStats(
		budget,
		transactions,
		daysElapsedInMonth(month),
		daysLeftInMonth(month),
	);

	stats.lastThirtyAvgDailySpend = averagePerDay(lastThirtyDays, 30);

	return stats;
}

/** Stats for a finished month: no projection, the balance is what is left. */
export async function calcStatsForMonth(month: string): Promise<Stats> {
	const budget = await getBudgetForMonth(month);
	const transactions = await getTransactionsForMonth(month);

	return statsForClosedMonth(budget, transactions, month);
}

export function statsForClosedMonth(
	budget: Budget | null,
	transactions: Transaction[],
	month: string,
): Stats {
	return computeStats(budget, transactions, daysInMonth(month), 0);
}

function computeStats(
	budget: Budget | null,
	transactions: Transaction[],
	elapsedDays: number,
	daysLeft: number,
): Stats {
	if (!budget) {
		return zeroStats();
	}

	const spentSoFar = transactions.reduce((total, curr) => total + curr.amount, 0);
	const currentBalance = budget.amount - spentSoFar;
	const percentRemaining =
		budget.amount > 0
			? (100 - (spentSoFar / budget.amount) * 100).toFixed(0)
			: '0';
	const avgDailySpend = elapsedDays > 0 ? spentSoFar / elapsedDays : 0;
	const projectedBalance = currentBalance - avgDailySpend * daysLeft;
	const projectedReward = projectedBalance * 0.2;
	const projectedSavings = projectedBalance - projectedReward;

	return {
		spentSoFar,
		currentBalance,
		percentRemaining,
		avgDailySpend,
		dailyTarget: budget.dailyTarget,
		projectedBalance,
		projectedReward,
		projectedSavings,
	};
}

function averagePerDay(transactions: Transaction[], days: number): number {
	const total = transactions.reduce((sum, curr) => sum + curr.amount, 0);

	return total / days;
}

function zeroStats(): Stats {
	return {
		spentSoFar: 0,
		currentBalance: 0,
		percentRemaining: '0',
		avgDailySpend: 0,
		dailyTarget: 0,
		projectedBalance: 0,
		projectedReward: 0,
		projectedSavings: 0,
	};
}
