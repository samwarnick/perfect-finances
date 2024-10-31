import { DateTime } from 'luxon';
import { db } from '../db/db';
import { transactions } from '../db/schema';
import { and, desc, gte, lte } from 'drizzle-orm';

export async function getThisMonthsTransactions() {
	const startOfMonth = DateTime.now()
		.startOf('month')
		.toFormat('yyyy-MM-dd HH:mm:ss');
	const endOfMonth = DateTime.now()
		.endOf('month')
		.toFormat('yyyy-MM-dd HH:mm:ss');
	const thisMonthsTransactions = await db
		.select()
		.from(transactions)
		.where(
			and(
				gte(transactions.createdAt, startOfMonth),
				lte(transactions.createdAt, endOfMonth),
			),
		).orderBy(desc(transactions.createdAt));

	return thisMonthsTransactions;
}
