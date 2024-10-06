import { DateTime } from 'luxon';
import { Budget, budgets, Transaction, transactions } from '../db/schema';
import { db } from '../db/db';
import { and, gte, lte } from 'drizzle-orm';

export type Stats = {
	spentSoFar: number;
	currentBalance: number;
	percentRemaining: string;
	avgDailySpend: number;
	lastThirtyAvgDailySpend: number;
	projectedBalance: number;
	projectedReward: number;
	projectedSavings: number;
};

export async function calcStats(): Promise<Stats> {
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

	const spentSoFar = getSpentSoFar(thisMonthsTransactions);
	const currentBalance = budget.amount - spentSoFar;
	const percentRemaining = (100 - (spentSoFar / budget.amount) * 100).toFixed(
		0,
	);
	const avgDailySpend = getAvgDailySpend(
		thisMonthsTransactions,
		getDaysSoFarInMonth(),
	);
	const lastThirtyAvgDailySpend = getAvgDailySpend(
		lastThirtyDaysTransactions,
		30,
	);
	const projectedBalance = currentBalance - getProjectedSpend(avgDailySpend);
	const projectedReward = projectedBalance * 0.2;
	const projectedSavings = projectedBalance - projectedReward;
	return {
		spentSoFar,
		currentBalance,
		percentRemaining,
		avgDailySpend,
		lastThirtyAvgDailySpend,
		projectedBalance,
		projectedReward,
		projectedSavings,
	};
}

function getSpentSoFar(transactions: Transaction[]) {
	return transactions.reduce((total, curr) => {
		return total + curr.amount;
	}, 0);
}

function groupTransactionsByDay(transactions: Transaction[]) {
	return transactions.reduce(
		(acc, curr) => {
			const date = DateTime.fromFormat(
				curr.createdAt,
				'yyyy-MM-dd hh:mm:ss',
			).startOf('day');
			const key = date.toISO()!;

			if (!acc[key]) {
				acc[key] = 0;
			}
			acc[key] = acc[key] + curr.amount;
			return acc;
		},
		{} as { [key: string]: number },
	);
}

function getDaysSoFarInMonth() {
	const now = DateTime.now();
	const startOfMonth = now.startOf('month');
	const elapsedDays = Math.abs(startOfMonth.diff(now, 'days').days);
	return Math.ceil(elapsedDays);
}

function getAvgDailySpend(transactions: Transaction[], days: number) {
	const perDay = groupTransactionsByDay(transactions);
	const dailySum = Object.values(perDay).reduce((acc, num) => acc + num, 0);
	return dailySum / days;
}

function getDaysLeftInMonth() {
	const now = DateTime.now();
	const endOfMonth = now.endOf('month');
	const daysLeft = endOfMonth.diff(now, 'days').days;
	return Math.ceil(daysLeft);
}

function getProjectedSpend(avgDailySpend: number) {
	const daysLeftInMonth = getDaysLeftInMonth();
	return avgDailySpend * daysLeftInMonth;
}
