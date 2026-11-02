import { currentMonth } from '#lib/server/months.js';
import { getTransactionsForMonth } from '#lib/server/transactions.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return Response.json(await getTransactionsForMonth(currentMonth()));
};
