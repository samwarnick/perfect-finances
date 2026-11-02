<script lang="ts">
	let { value }: { value: string } = $props();

	const characters = $derived(Array.from(value));
</script>

<span class="sr-only">{value}</span>
<span class="ticker" aria-hidden="true">
	{#each characters as char, index (index)}
		{#if char >= '0' && char <= '9'}
			<span class="digit">
				<span class="strip" style="transform: translateY(-{Number(char) * 10}%)">
					{#each '0123456789' as digit}
						<span>{digit}</span>
					{/each}
				</span>
			</span>
		{:else}
			<span class="char">{char}</span>
		{/if}
	{/each}
</span>
