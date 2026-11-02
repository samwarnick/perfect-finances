<script lang="ts">
	import { enhance } from '$app/forms';
	import Details from '#lib/components/Details.svelte';
	import Transactions from '#lib/components/Transactions.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div class="home-grid">
	<Details stats={data.stats} />

	<form method="POST" action="?/add" use:enhance class="pop entry">
		<h2>What did you spend?</h2>

		{#if form?.issues}
			<p class="error" role="alert">{form.issues.join(' ')}</p>
		{/if}

		<label class="field">
			<span>Amount</span>
			<div class="input-affix">
				<span class="affix" aria-hidden="true">$</span>
				<input name="amount" type="number" placeholder="100.00" step="any" />
			</div>
		</label>
		<label class="field">
			<span>Notes</span>
			<input name="notes" type="text" placeholder="Gas, groceries…" />
		</label>
		<button type="submit">Add it</button>
	</form>
</div>

<div class="recent">
	<Transactions
		transactions={data.recent}
		title="This month"
		empty="No spending logged yet this month."
	/>
</div>
