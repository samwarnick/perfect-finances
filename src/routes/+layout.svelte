<script lang="ts">
	import 'open-props/style';
	import 'open-props/normalize';
	import '#lib/theme.css';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/history', label: 'History' },
		{ href: '/manage', label: 'Manage' }
	];
</script>

<header class="topbar">
	<div class="wrap">
		<a class="logo" href="/">
			<span class="dot"></span>
			Perfect Finances
		</a>

		<nav class="nav">
			{#each links as link}
				<a
					href={link.href}
					aria-current={page.url.pathname === link.href ? 'page' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</div>
</header>

<main class="wrap">
	{@render children()}
</main>
