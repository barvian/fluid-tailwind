<script lang="ts">
	let cls = ''
	export { cls as class }

	export let icon: 'warn' | 'info' = 'info'
</script>

<div class="{cls} InfoTip mb-5 flex space-x-2">
	{#if icon === 'info'}
		<svg
			class="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else}
		<svg
			viewBox="0 0 20 20"
			fill="currentColor"
			role="presentation"
			class="size-5 shrink-0 fill-amber-500 dark:fill-amber-100"
			><path
				fill-rule="evenodd"
				d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
				clip-rule="evenodd"
			></path></svg
		>
	{/if}

	<p class="m-0 text-sm font-medium text-slate-700 dark:text-slate-200"><slot /></p>
</div>
