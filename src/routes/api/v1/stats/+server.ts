import { calcCurrentMonthStats } from '#lib/server/stats.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return Response.json(await calcCurrentMonthStats());
};
