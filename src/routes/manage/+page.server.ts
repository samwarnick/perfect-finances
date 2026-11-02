import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import {
	ensureBudgetForMonth,
	updateBudgetForMonth,
} from '#lib/server/budgets.js';
import { currentMonth, monthLabel } from '#lib/server/months.js';
import { parseForm } from '#lib/server/validation.js';
import type { Actions, PageServerLoad } from './$types';

const budgetSchema = z.object({
	amount: z.coerce.number(),
	dailyTarget: z.coerce.number(),
});

export const load: PageServerLoad = async () => {
	const month = currentMonth();

	return {
		month,
		label: monthLabel(month),
		budget: await ensureBudgetForMonth(month),
	};
};

export const actions = {
	budget: async ({ request }) => {
		const result = parseForm(budgetSchema, await request.formData());

		if (!result.success) {
			return fail(400, { issues: result.issues });
		}

		const { amount, dailyTarget } = result.data;

		await updateBudgetForMonth(currentMonth(), {
			amount: Math.round(amount * 100),
			dailyTarget: Math.round(dailyTarget * 100),
		});
	},
} satisfies Actions;
