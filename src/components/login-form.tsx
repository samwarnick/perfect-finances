import { html } from 'hono/html';

export function LoginForm({
	username = '',
	error = '',
}: { username?: string; error?: string } = {}) {
	return html` <form
		class="login-form"
		hx-post="/login"
		hx-swap="outerHTML"
		hx-target="this"
	>
		<h2>Login</h2>
		${error && <p class="error">{error}</p>}
		<label for="username">Username:</label>
		<input
			type="text"
			id="username"
			name="username"
			value="${username}"
			required
		/>
		<label for="password">Password:</label>
		<input type="password" id="password" name="password" required />
		<button type="submit">Login</button>
	</form>`;
}
