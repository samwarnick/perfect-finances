import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { db } from './db';

export function performMigration() {
	migrate(db, { migrationsFolder: './src/db/migrations' });
}

performMigration();
