import { Hono } from 'hono';
import { html } from 'hono/html';
import { Layout } from '../layout';
import { LoginForm } from '../components/login-form';
import { createSession, deleteSession, SESSION_EXPIRES_IN_MS } from '../utils/session';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const auth = new Hono();

auth.get('/login', c => {
	return c.html(
		<Layout title="Login">
			<main id="login-container">
				<LoginForm />
			</main>
		</Layout>,
	);
});

auth.post('/logout', async c => {
	const sessionId = getCookie(c, 'session_id');
	if (sessionId) {
		await deleteSession(sessionId);
		deleteCookie(c, 'session_id', { path: '/' });
	}
	c.header('HX-Location', '/login');
	return c.body(null, 200);
});

auth.post('/login', zValidator(
	'form',
	z.object({ username: z.string(), password: z.string() }),
), async c => {
	const { username, password } = c.req.valid('form');

	if (
		Bun.env.USERNAMES.split(',').includes(username as string) &&
		password === Bun.env.PASSWORD
	) {
		const session = await createSession(username as string);
		setCookie(c, 'session_id', session.id, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: SESSION_EXPIRES_IN_MS / 1000,
		});

		c.header('HX-Location', '/');
		return c.body(null, 200);
	}

	c.status(401);
	return c.html(
			<LoginForm
				username={username as string}
				error="Invalid username or password"
			/>
	);
});
