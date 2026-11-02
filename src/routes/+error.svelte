<script lang="ts">
	import { page } from '$app/state';

	const isNotFound = $derived(page.status === 404);
</script>

<section class="pop error-card">
	<p class="label">Error {page.status}</p>
	<h1>{isNotFound ? 'This page wandered off' : 'Something broke'}</h1>
	<p class="error-copy">
		{isNotFound
			? "We couldn't find the page you were looking for."
			: 'Try that again in a moment.'}
	</p>
	{#if !isNotFound && page.error?.message}
		<p class="error-detail">{page.error.message}</p>
	{/if}
	<a class="link-button" href="/">Back home</a>
</section>
