import { and, asc, desc, eq, gt, gte, lt, lte, ne } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { getDb } from './db';
import { budgets, transactions } from './schema';
import { currentMonth, monthOfTimestamp, monthRange } from '../months';
import type * as schema from './schema';

/**
 * Guarantees the monthly-budget invariant: every month that has transactions
 * also has a budget, and every transaction points at its own month's budget.
 *
 * This is not a SQL migration because a month is defined in America/New_York,
 * where SQLite cannot account for daylight saving. It runs after migrations on
 * every start and is idempotent, so it also repairs databases that predate
 * monthly budgets, imports or hand-edited rows.
 *
 * Months with no activity are deliberately left alone.
 */
export function syncBudgetMonths(): void {
	const db = getDb();
	const month = currentMonth();

	// The single budget row from before monthly budgets becomes this month's,
	// unless this month already has one.
	const legacy = db.select().from(budgets).where(eq(budgets.month, '')).get();

	if (legacy) {
		const existing = db
			.select()
			.from(budgets)
			.where(eq(budgets.month, month))
			.get();

		if (existing) {
			db.delete(budgets).where(eq(budgets.id, legacy.id)).run();
		} else {
			db.update(budgets).set({ month }).where(eq(budgets.id, legacy.id)).run();
		}
	}

	const months = new Set<string>([month]);

	for (const row of db
		.select({ createdAt: transactions.createdAt })
		.from(transactions)
		.all()) {
		months.add(monthOfTimestamp(row.createdAt));
	}

	for (const target of months) {
		const budget =
			db.select().from(budgets).where(eq(budgets.month, target)).get() ??
			cloneBudget(db, target);
		const { start, end } = monthRange(target);

		db.update(transactions)
			.set({ budget: budget.id })
			.where(
				and(
					gte(transactions.createdAt, start),
					lte(transactions.createdAt, end),
					ne(transactions.budget, budget.id),
				),
			)
			.run();
	}
}

/** Copied from the nearest month, so a missing month keeps the going rate. */
function cloneBudget(
	db: BunSQLiteDatabase<typeof schema>,
	month: string,
) {
	const before = db
		.select()
		.from(budgets)
		.where(lt(budgets.month, month))
		.orderBy(desc(budgets.month))
		.limit(1)
		.get();

	const after = before
		? undefined
		: db
				.select()
				.from(budgets)
				.where(gt(budgets.month, month))
				.orderBy(asc(budgets.month))
				.limit(1)
				.get();

	const source = before ?? after;

	return db
		.insert(budgets)
		.values({
			name: source?.name ?? 'Expenses',
			amount: source?.amount ?? 0,
			dailyTarget: source?.dailyTarget ?? 0,
			month,
		})
		.returning()
		.get();
}
