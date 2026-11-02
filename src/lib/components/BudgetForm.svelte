<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Budget } from '#lib/server/db/schema.js';

	let { budget }: { budget: Budget } = $props();
</script>

<form method="POST" action="?/budget" use:enhance class="budget-form">
	<div class="short">
		<label class="field">
			<span>Monthly budget</span>
			<input
				name="amount"
				type="number"
				placeholder="100.00"
				step="any"
				value={(budget.amount / 100).toFixed(2)}
			/>
		</label>
		<label class="field">
			<span>Daily target</span>
			<input
				name="dailyTarget"
				type="number"
				placeholder="100.00"
				step="any"
				value={(budget.dailyTarget / 100).toFixed(2)}
			/>
		</label>
	</div>
	<button type="submit">Save</button>
</form>
