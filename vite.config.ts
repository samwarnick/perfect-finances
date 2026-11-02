import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			port: 3000
		},
		plugins: [
			sveltekit({
				compilerOptions: {
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter(),
				paths: {
					origin: env.ORIGIN || process.env.ORIGIN || undefined,
					relative: false
				}
			})
		]
	};
});
