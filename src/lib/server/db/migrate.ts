import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { getDb } from './db';
import { syncBudgetMonths } from './sync';

export function performMigration() {
	migrate(getDb(), { migrationsFolder: './src/lib/server/db/migrations' });
	syncBudgetMonths();
}

if (import.meta.main) {
	performMigration();
}
