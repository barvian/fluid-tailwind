<script lang="ts">
	let cls = ''
	export { cls as class }
</script>

<div class="{cls} not-prose mb-5 flex space-x-2" data-info>
	<svg
		class="h-5 w-5 flex-none text-slate-400 dark:text-slate-600"
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

	<p class="m-0 max-w-prose text-sm font-medium text-slate-700 dark:text-slate-200"><slot /></p>
</div>
