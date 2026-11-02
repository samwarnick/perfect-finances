import { desc, eq, ne } from 'drizzle-orm';
import { getDb } from './db/db';
import { budgets, type Budget } from './db/schema';
import { currentMonth } from './months';

export async function getBudgetForMonth(month: string): Promise<Budget | null> {
	const rows = await getDb()
		.select()
		.from(budgets)
		.where(eq(budgets.month, month))
		.limit(1);

	return rows[0] ?? null;
}

/**
 * The budget for a month, cloned from the most recent month the first time the
 * month is visited. Editing it later never touches past months.
 */
export async function ensureBudgetForMonth(month: string): Promise<Budget> {
	const existing = await getBudgetForMonth(month);

	if (existing) {
		return existing;
	}

	const db = getDb();
	const latest = (
		await db
			.select()
			.from(budgets)
			.where(ne(budgets.month, month))
			.orderBy(desc(budgets.month))
			.limit(1)
	)[0];

	await db
		.insert(budgets)
		.values({
			name: latest?.name ?? 'Expenses',
			amount: latest?.amount ?? 0,
			dailyTarget: latest?.dailyTarget ?? 0,
			month,
		})
		.onConflictDoNothing();

	const created = await getBudgetForMonth(month);

	if (!created) {
		throw new Error(`Could not create a budget for ${month}`);
	}

	return created;
}

export async function updateBudgetForMonth(
	month: string,
	values: { amount: number; dailyTarget: number },
): Promise<void> {
	await ensureBudgetForMonth(month);
	await getDb()
		.update(budgets)
		.set(values)
		.where(eq(budgets.month, month));
}

/** Every month except the current one, newest first. */
export async function getPastBudgetMonths(limit?: number): Promise<Budget[]> {
	const query = getDb()
		.select()
		.from(budgets)
		.where(ne(budgets.month, currentMonth()))
		.orderBy(desc(budgets.month));

	return limit ? query.limit(limit) : query;
}
