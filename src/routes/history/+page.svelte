<script lang="ts">
	import MonthHistory from '#lib/components/MonthHistory.svelte';
	import SpendChart from '#lib/components/SpendChart.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="page-title">History</h1>

{#if data.months.length === 0}
	<section class="pop">
		<p class="empty">
			No past months yet. Once a month closes it will show up here.
		</p>
	</section>
{:else}
	<SpendChart months={data.months} />

	<div class="stack">
		{#each data.months as month (month.month)}
			<MonthHistory {month} />
		{/each}
	</div>
{/if}
