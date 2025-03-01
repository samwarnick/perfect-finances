import { DateTime } from 'luxon';
import { db } from '../db/db';
import { transactions } from '../db/schema';
import { and, desc, gte, lte } from 'drizzle-orm';

export async function getThisMonthsTransactions() {
	const startOfMonth = DateTime.now()
		.setZone('America/New_York')
		.startOf('month')
		.toUTC()
		.toFormat('yyyy-MM-dd HH:mm:ss');
	const endOfMonth = DateTime.now()
		.setZone('America/New_York')
		.endOf('month')
		.toUTC()
		.toFormat('yyyy-MM-dd HH:mm:ss');

	return getTransactions(startOfMonth, endOfMonth);
}

export async function getLastMonthsTransactions() {
	const startOfLastMonth = DateTime.now()
		.minus({month: 1})
		.startOf('month')
		.toFormat('yyyy-MM-dd HH:mm:ss');
	const endOfLastMonth = DateTime.now()
		.minus({month: 1})
		.endOf('month')
		.toFormat('yyyy-MM-dd HH:mm:ss');

	return getTransactions(startOfLastMonth, endOfLastMonth);
}

export async function getLastThirtyDaysTransactions() {
	const today = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
	const thirtyDaysAgo = DateTime.now()
		.minus({ days: 30 })
		.toFormat('yyyy-MM-dd HH:mm:ss');

	return getTransactions(thirtyDaysAgo, today);
}

async function getTransactions(startDate: string, endDate: string) {
	return db
		.select()
		.from(transactions)
		.where(
			and(
				gte(transactions.createdAt, startDate),
				lte(transactions.createdAt, endDate),
			),
		).orderBy(desc(transactions.createdAt));
}
