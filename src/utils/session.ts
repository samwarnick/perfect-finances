import { db } from '../db/db';
import { sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const SESSION_EXPIRES_IN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export async function createSession(userId: string) {
	const sessionId = nanoid();
	const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN_MS);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt,
	});

	return {
		id: sessionId,
		userId,
		expiresAt,
	};
}

export async function getSession(sessionId: string) {
	return await db.query.sessions.findFirst({
		where: eq(sessions.id, sessionId),
	});
}

export async function deleteSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
