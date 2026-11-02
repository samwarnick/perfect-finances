<script lang="ts">
	import TransactionRows from '#lib/components/TransactionRows.svelte';
	import { formatAmount } from '#lib/format.js';
	import type { MonthHistory } from '#lib/server/history.js';

	let { month }: { month: MonthHistory } = $props();

	const used = $derived(
		Math.max(0, Math.min(100, 100 - Number(month.stats.percentRemaining)))
	);
	const overspent = $derived(month.stats.currentBalance < 0);
	const count = $derived(month.transactions.length);
	const panelId = $derived(`transactions-${month.month}`);

	let open = $state(false);
</script>

<article class="pop month-card">
	<header class="month-head">
		<div class="month-title">
			<h2>{month.label}</h2>
			<p class="month-sub">
				{formatAmount(month.stats.spentSoFar)} of
				{formatAmount(month.budget.amount)} used
			</p>
		</div>
		<div class="month-left">
			<span class="label">{overspent ? 'Over' : 'Left'}</span>
			<strong>{formatAmount(Math.abs(month.stats.currentBalance))}</strong>
		</div>
		<ul class="chips month-chips">
			<li class="chip">{formatAmount(month.stats.avgDailySpend)}/day</li>
			<li
				class="chip"
				class:positive={month.stats.projectedReward >= 0}
				class:negative={month.stats.projectedReward < 0}
			>
				fun {formatAmount(month.stats.projectedReward)}
			</li>
			<li
				class="chip"
				class:positive={month.stats.projectedSavings >= 0}
				class:negative={month.stats.projectedSavings < 0}
			>
				save {formatAmount(month.stats.projectedSavings)}
			</li>
		</ul>
	</header>

	<div class="track" aria-hidden="true">
		<span style="width: {used}%"></span>
		{#if overspent}
			<span class="track-over"></span>
		{/if}
	</div>

	{#if count === 0}
		<p class="empty">No spending recorded.</p>
	{:else}
		<button
			type="button"
			class="disclosure"
			aria-expanded={open}
			aria-controls={panelId}
			onclick={() => (open = !open)}
		>
			{count} {count === 1 ? 'transaction' : 'transactions'}
		</button>

		<div id={panelId} class="month-panel" class:open inert={!open}>
			<div class="month-panel-inner">
				<TransactionRows transactions={month.transactions} deletable />
			</div>
		</div>
	{/if}
</article>
