<script lang="ts">
	import { formatAmount } from '#lib/format.js';
	import type { MonthHistory } from '#lib/server/history.js';

	let {
		months,
		target
	}: { months: MonthHistory[]; target: number } = $props();

	const PLOT_HEIGHT = 140;

	// history arrives newest first; charts read left to right
	const series = $derived([...months].reverse());
	const peak = $derived(
		Math.max(target, ...series.map((month) => month.stats.avgDailySpend), 1)
	);

	// three gridlines up to the target; keep stepping past it when a month overspends
	const step = $derived(target / 3);
	const scale = $derived.by(() => {
		const headroom = Math.max(peak * 1.06, 1);

		if (step <= 0 || peak <= target) return headroom;

		// round up to the next gridline so the tallest bar sits below a labelled tick
		return Math.ceil(headroom / step) * step;
	});

	const ticks = $derived.by(() => {
		if (step <= 0) return [];

		return Array.from({ length: Math.floor(scale / step + 1e-9) }, (_, i) => {
			const value = (i + 1) * step;

			return {
				value,
				top: PLOT_HEIGHT * (1 - value / scale),
				isTarget: Math.abs(value - target) < 0.01,
			};
		});
	});

	function tone(month: MonthHistory) {
		const { avgDailySpend, currentBalance } = month.stats;
		const dailyTarget = month.budget.dailyTarget;

		if (dailyTarget <= 0) return 'good';

		const delta = avgDailySpend - dailyTarget;

		// over target but the month still finished with money left: warn, don't alarm
		if (delta > 0) return currentBalance > 0 ? 'close' : 'over';

		if (delta < -500) return 'good';

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
				class:is-target={tick.isTarget}
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
						data-tone={tone(month)}
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
