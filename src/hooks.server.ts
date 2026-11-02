import type { ServerInit } from '@sveltejs/kit/hooks';
import { performMigration } from '#lib/server/db/migrate.js';

export const init: ServerInit = () => {
	performMigration();
};
