import { sql, type InferSelectModel } from 'drizzle-orm';
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const budgets = sqliteTable(
	'budgets',
	{
		id: integer('id').primaryKey(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		name: text('name').notNull(),
		amount: integer('amount').notNull(),
		dailyTarget: integer('daily_target').notNull().default(0),
		// 'YYYY-MM' in America/New_York. One budget row per month.
		month: text('month').notNull().default(''),
	},
	(table) => [uniqueIndex('budgets_month_unique').on(table.month)],
);

export const transactions = sqliteTable('transactions', {
	id: integer('id').primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	amount: integer('amount').default(0).notNull(),
	notes: text('notes'),
	budget: integer('budget_id')
		.references(() => budgets.id)
		.notNull(),
});

export type Budget = InferSelectModel<typeof budgets>;
export type Transaction = InferSelectModel<typeof transactions>;
