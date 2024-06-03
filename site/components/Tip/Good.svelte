<script lang="ts">
	export let line = true
</script>

<div class="my-6 flex items-start space-x-4">
	<div
		class="relative mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-white ring-2 ring-cyan-500 dark:bg-sky-500 dark:ring-sky-500"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			class="size-2.5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m4.5 12.75 6 6 9-13.5"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
		{#if line}
			<div
				class="absolute left-[0.46875rem] top-full mt-1 h-[1.375rem] w-px rounded-full bg-cyan-500/30 dark:bg-sky-400/30"
			/>
		{/if}
	</div>
	<p class="m-0 flex-1 text-base font-semibold text-slate-900 dark:text-slate-200">
		<slot />
	</p>
</div>
