<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';

	let {
		id,
		name,
		value,
		display,
		action,
		label,
		prefix = '',
		type = 'text',
		empty = ''
	}: {
		id: number;
		name: string;
		value: string;
		display: string;
		action: string;
		label: string;
		prefix?: string;
		type?: 'text' | 'number';
		empty?: string;
	} = $props();

	let editing = $state(false);
	let submitting = $state(false);
	let cancelled = false;
	let input = $state<HTMLInputElement | null>(null);
	let form = $state<HTMLFormElement | null>(null);

	const text = $derived(value === '' ? empty : display);

	async function start() {
		cancelled = false;
		editing = true;
		await tick();
		input?.focus();
		input?.select();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelled = true;
			editing = false;
		}
	}

	function onBlur() {
		if (cancelled || submitting) return;

		if (!input || input.value === value) {
			editing = false;
			return;
		}

		form?.requestSubmit();
	}
</script>

{#if editing}
	<form
		bind:this={form}
		method="POST"
		{action}
		class="inline-edit"
		class:is-amount={type === 'number'}
		use:enhance={() => {
			submitting = true;

			return async ({ update }) => {
				await update();
				submitting = false;
				editing = false;
			};
		}}
	>
		<input type="hidden" name="id" value={id} />
		{#if prefix}<span class="edit-prefix" aria-hidden="true">{prefix}</span>{/if}
		<input
			bind:this={input}
			{name}
			{type}
			step={type === 'number' ? 'any' : undefined}
			{value}
			placeholder={empty}
			aria-label={label}
			onkeydown={onKeydown}
			onblur={onBlur}
		/>
	</form>
{:else}
	<button
		type="button"
		class="editable"
		class:is-empty={value === ''}
		title={label}
		aria-label={`${label}: ${text}`}
		onclick={start}
	>
		{text}
	</button>
{/if}
