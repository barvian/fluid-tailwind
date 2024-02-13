<script lang="ts">
	import { resize } from '/lib/actions'
	import { writable } from 'svelte/store'
	import * as Tip from '/components/Tip'

	let well: HTMLDivElement

	let margin = writable(0),
		resizing = writable(false)
	export let height = 'h-auto'
	export let tooNarrowClass = 'lg:hidden'
</script>

<Tip.Info class={tooNarrowClass}>Your browser isn't wide enough to see the full effect</Tip.Info>
<div class="not-prose @container ~min-w-[16rem]/[24rem] relative -mb-8 max-w-full">
	<div
		bind:this={well}
		class="@container bg-grid-slate-100 dark:bg-grid-slate-700/25 relative box-content flex max-w-full flex-col items-center justify-center overflow-hidden rounded-t-xl border border-slate-900/5 bg-slate-50 p-6 pb-10 dark:bg-slate-800/25 {height}"
		style:margin-right="clamp(0px, {$margin}px, 50cqw)"
	>
		<slot />
	</div>
	<button
		tabindex="-1"
		class="group absolute left-full top-1/2 -mt-6 cursor-ew-resize touch-pan-y p-2"
		aria-label="Resize"
		style:transform="translateX(clamp(-50cqw, {-$margin}px, 0px))"
		use:resize={{
			direction: 'right',
			value: margin,
			resizing,
			onStop: () => ($margin = parseFloat(getComputedStyle(well).marginRight))
		}}
	>
		<div
			class="h-8 w-1.5 rounded-full bg-slate-500/60 group-hover:bg-slate-500/80 {$resizing
				? 'bg-slate-500/80'
				: ''}"
		/>
	</button>
</div>
