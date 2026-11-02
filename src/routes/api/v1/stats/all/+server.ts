import { currentMonth, previousMonth } from '#lib/server/months.js';
import { calcCurrentMonthStats, calcStatsForMonth } from '#lib/server/stats.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const month = currentMonth();
	const currentMonthStats = await calcCurrentMonthStats();
	const lastMonth = await calcStatsForMonth(previousMonth(month));

	return Response.json({ currentMonth: currentMonthStats, lastMonth });
};
