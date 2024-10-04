import { sql, type InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';

export const budgets = sqliteTable('budgets', {
	id: integer('id').primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	name: text('name').notNull(),
	amount: integer('amount').notNull(),
});

export const transactions = sqliteTable('transactions', {
	id: integer('id').primaryKey(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	amount: integer('amount').default(0).notNull(),
	user: text('user').notNull(),
	budget: integer('budget_id')
		.references(() => budgets.id)
		.notNull(),
});

export type Budget = InferSelectModel<typeof budgets>;
export type Transaction = InferSelectModel<typeof transactions>;
