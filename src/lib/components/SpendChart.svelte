<script lang="ts">
	import { formatAmount } from '#lib/format.js';
	import type { MonthHistory } from '#lib/server/history.js';

	let { months }: { months: MonthHistory[] } = $props();

	const PLOT_HEIGHT = 140;

	// history arrives newest first; charts read left to right
	const series = $derived([...months].reverse());
	const target = $derived(series[0]?.budget.dailyTarget ?? 0);
	const peak = $derived(
		Math.max(target, ...series.map((month) => month.stats.avgDailySpend), 1)
	);
	const scale = $derived(Math.max(peak * 1.06, target * 1.06, 1));

	const ticks = $derived(
		target > 0
			? [target / 3, (target * 2) / 3, target].map((value) => ({
					value,
					top: PLOT_HEIGHT * (1 - value / scale),
				}))
			: [],
	);

	function tone(avg: number, dailyTarget: number) {
		if (dailyTarget <= 0) return 'good';

		const delta = avg - dailyTarget;

		if (delta < -500) return 'good';
		if (delta > 500) return 'over';

		return 'close';
	}

	function compact(cents: number) {
		const dollars = cents / 100;

		return `$${dollars.toLocaleString('en-US', {
			maximumFractionDigits: dollars % 1 === 0 ? 0 : 2,
		})}`;
	}

	function shortMonth(label: string) {
		return label.slice(0, 3);
	}
</script>

<section class="pop chart" aria-label="Average daily spend by month">
	<header class="chart-head">
		<h2>Daily spend</h2>
		<p class="chart-target">
			last {series.length} months · target {formatAmount(target)}/day
		</p>
	</header>

	<div class="chart-grid">
		{#each ticks as tick}
			<div
				class="chart-tick"
				class:is-target={tick.value === target}
				style="top: {tick.top}px"
				aria-hidden="true"
			>
				<span class="chart-tick-label">{compact(tick.value)}</span>
			</div>
		{/each}

		{#each series as month (month.month)}
			<div class="chart-col">
				<div class="chart-slot" style="height: {PLOT_HEIGHT}px" aria-hidden="true">
					<span
						class="chart-bar"
						data-tone={tone(month.stats.avgDailySpend, month.budget.dailyTarget)}
						style="height: {Math.max(
							4,
							(month.stats.avgDailySpend / scale) * PLOT_HEIGHT
						)}px"
					></span>
				</div>
				<span class="chart-value">{formatAmount(month.stats.avgDailySpend)}</span>
				<span class="chart-month">{shortMonth(month.label)}</span>
			</div>
		{/each}
	</div>
</section>
