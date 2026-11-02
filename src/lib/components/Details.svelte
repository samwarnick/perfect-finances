<script lang="ts">
	import RollingAmount from '#lib/components/RollingAmount.svelte';
	import { formatAmount } from '#lib/format.js';
	import type { Stats } from '#lib/types.js';

	let {
		stats,
		label = 'Remaining'
	}: { stats: Stats; label?: string } = $props();

	const percent = $derived(Number(stats.percentRemaining));
	const budget = $derived(stats.currentBalance + stats.spentSoFar);

	// Below target - $5 is healthy, within $5 is close, above + $5 is over.
	const tone = $derived.by(() => {
		if (stats.dailyTarget <= 0) return 'good';

		const delta = stats.avgDailySpend - stats.dailyTarget;

		if (delta < -500) return 'good';
		if (delta > 500) return 'over';

		return 'close';
	});
</script>

<article class="balance-card" data-tone={tone}>
	<p class="label">{label}</p>

	<p class="balance-amount">
		<RollingAmount value={formatAmount(stats.currentBalance)} />
	</p>
	<p class="caption">
		{formatAmount(stats.spentSoFar)} of {formatAmount(budget)} used
	</p>

	<div class="track" aria-hidden="true">
		<span style="width: {Math.max(0, Math.min(100, percent))}%"></span>
	</div>

	<ul class="chips">
		<li class="chip">{formatAmount(stats.avgDailySpend)}/day</li>
		<li class="chip">target {formatAmount(stats.dailyTarget)}/day</li>
		<li class="chip">fun {formatAmount(stats.projectedReward)}</li>
		<li class="chip">save {formatAmount(stats.projectedSavings)}</li>
	</ul>
</article>
