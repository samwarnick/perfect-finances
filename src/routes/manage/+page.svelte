<script lang="ts">
	import BudgetForm from '#lib/components/BudgetForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1 class="page-title">Manage</h1>

<section class="pop">
	<div class="card-head">
		<h2 class="card-title">Budget for {data.label}</h2>
		<p class="card-hint">
			Carried over from last month. Changes apply to this month only.
		</p>
	</div>

	{#if form?.issues}
		<p class="error" role="alert">{form.issues.join(' ')}</p>
	{/if}

	<BudgetForm budget={data.budget} />
</section>
