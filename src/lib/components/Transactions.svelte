<script lang="ts">
	import TransactionRows from '#lib/components/TransactionRows.svelte';
	import type { Transaction } from '#lib/server/db/schema.js';

	let {
		transactions,
		title = 'Recent spending',
		deletable = true,
		empty = 'Nothing here yet.'
	}: {
		transactions: Transaction[];
		title?: string;
		deletable?: boolean;
		empty?: string;
	} = $props();
</script>

<section class="pop">
	<h2 class="card-title">{title}</h2>

	{#if transactions.length === 0}
		<p class="empty">{empty}</p>
	{:else}
		<TransactionRows {transactions} {deletable} />
	{/if}
</section>
