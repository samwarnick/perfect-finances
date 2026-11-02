import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const DB_PATH = 'db/sqlite.db';

let instance: BunSQLiteDatabase<typeof schema> | undefined;

/**
 * Open the database on first use rather than on import. Vite imports route
 * modules while analysing them during a build, and a build should not need a
 * database to exist.
 */
export function getDb(): BunSQLiteDatabase<typeof schema> {
	if (!instance) {
		mkdirSync(dirname(DB_PATH), { recursive: true });
		instance = drizzle({
			client: new Database(DB_PATH),
			schema,
			logger: process.env.NODE_ENV === 'development',
		});
	}

	return instance;
}
