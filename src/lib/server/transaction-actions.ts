import { fail, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from './db/db';
import { transactions } from './db/schema';
import { parseForm } from './validation';

const id = z.coerce.number();

const deleteSchema = z.object({ id });
const amountSchema = z.object({ id, amount: z.coerce.number().positive() });
const notesSchema = z.object({ id, notes: z.string().max(200) });

export async function deleteTransactionAction({ request }: RequestEvent) {
	const result = parseForm(deleteSchema, await request.formData());

	if (!result.success) {
		return fail(400, { issues: result.issues });
	}

	await getDb()
		.delete(transactions)
		.where(eq(transactions.id, result.data.id));
}

export async function updateAmountAction({ request }: RequestEvent) {
	const result = parseForm(amountSchema, await request.formData());

	if (!result.success) {
		return fail(400, { issues: result.issues });
	}

	await getDb()
		.update(transactions)
		.set({ amount: Math.round(result.data.amount * 100) })
		.where(eq(transactions.id, result.data.id));
}

export async function updateNotesAction({ request }: RequestEvent) {
	const result = parseForm(notesSchema, await request.formData());

	if (!result.success) {
		return fail(400, { issues: result.issues });
	}

	await getDb()
		.update(transactions)
		.set({ notes: result.data.notes.trim() || null })
		.where(eq(transactions.id, result.data.id));
}
