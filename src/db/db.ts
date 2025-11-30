import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const sqlite = new Database('db/sqlite.db');
export const db = drizzle({
	client: sqlite,
	schema,
	logger: Bun.env.ENV === 'development',
});
