import { and, desc, gte, lte } from 'drizzle-orm';
import { getDb } from './db/db';
import { transactions } from './db/schema';
import {
	daysAgoTimestamp,
	monthRange,
	nowTimestamp,
} from './months';

export async function getTransactionsForMonth(month: string) {
	const { start, end } = monthRange(month);

	return getTransactionsBetween(start, end);
}

export async function getLastThirtyDaysTransactions() {
	return getTransactionsBetween(daysAgoTimestamp(30), nowTimestamp());
}

export async function getTransactionsBetween(start: string, end: string) {
	return getDb()
		.select()
		.from(transactions)
		.where(
			and(
				gte(transactions.createdAt, start),
				lte(transactions.createdAt, end),
			),
		)
		.orderBy(desc(transactions.createdAt));
}
