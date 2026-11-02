<script lang="ts">
	import { enhance } from '$app/forms';
	import EditableField from '#lib/components/EditableField.svelte';
	import { formatAmount } from '#lib/format.js';
	import type { Transaction } from '#lib/server/db/schema.js';

	let {
		transactions,
		deletable = false
	}: { transactions: Transaction[]; deletable?: boolean } = $props();

	function formatDate(createdAt: string) {
		return new Date(createdAt + 'Z').toLocaleDateString('en-US', {
			timeZone: 'America/New_York',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<ul class="rows">
	{#each transactions as transaction (transaction.id)}
		<li class="row">
			<div class="meta">
				<span class="when">{formatDate(transaction.createdAt)}</span>
				<EditableField
					id={transaction.id}
					name="notes"
					value={transaction.notes ?? ''}
					display={transaction.notes ?? ''}
					action="?/updateNotes"
					label="Edit notes"
					empty="Add a note"
				/>
			</div>

			<div class="amount">
				<EditableField
					id={transaction.id}
					name="amount"
					value={(transaction.amount / 100).toFixed(2)}
					display={formatAmount(transaction.amount)}
					action="?/updateAmount"
					label="Edit amount"
					prefix="$"
					type="number"
				/>
			</div>

			{#if deletable}
				<form class="remove" method="POST" action="?/deleteTransaction" use:enhance>
					<input type="hidden" name="id" value={transaction.id} />
					<button class="kill" type="submit" aria-label="Delete transaction">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M7 7l10 10M17 7 7 17" />
						</svg>
					</button>
				</form>
			{/if}
		</li>
	{/each}
</ul>
