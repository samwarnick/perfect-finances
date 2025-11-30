import { createMiddleware } from 'hono/factory';
import { getSession, deleteSession } from '../utils/session';
import { deleteCookie, getCookie } from 'hono/cookie';

export const authMiddleware = createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, 'session_id');

	if (!sessionId) {
		if (
			c.req.path === '/login' ||
			c.req.path.startsWith('/assets') ||
			c.req.path.startsWith('/api') ||
			c.req.path === '/health'
		) {
			return next();
		}
		c.header('HX-Location', '/login');
		return c.redirect('/login');
	}

	const session = await getSession(sessionId);

	if (!session || new Date(session.expiresAt) < new Date()) {
		if (sessionId) {
			await deleteSession(sessionId);
			deleteCookie(c, 'session_id', { path: '/' });
		}
		if (
			c.req.path === '/login' ||
			c.req.path.startsWith('/assets') ||
			c.req.path.startsWith('/api') ||
			c.req.path === '/health'
		) {
			return next();
		}

		c.header('HX-Location', '/login');
		return c.redirect('/login');
	}

	c.set('username', session.userId);
	await next();
});
