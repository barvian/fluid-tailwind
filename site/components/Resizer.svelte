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

<div
	class="not-prose @container ~min-w-[16rem]/[24rem] relative -mb-8 max-w-full flex-1 select-none overflow-y-clip"
>
	<div
		bind:this={well}
		class="@container bg-grid-slate-100 dark:bg-grid-slate-700/25 relative flex max-w-full flex-col items-center justify-center rounded-t-xl border border-white/[.05] bg-[25%_50%,top_left] bg-slate-50 bg-[auto_470px,auto] bg-fixed p-6 pb-16 dark:bg-slate-800/25 {height}"
		style:margin-inline="clamp(0px, {$margin}px, 320px)"
	>
		<slot />
	</div>
	<button
		tabindex="-1"
		class="group absolute left-full top-0 -ml-2 h-full w-4 cursor-ew-resize touch-pan-y outline-none"
		aria-label="Resize"
		style:transform="translateX(clamp(-320px, {-$margin}px, 0px))"
		use:resize={{
			direction: 'right',
			value: margin,
			resizing,
			onStop: () => ($margin = parseFloat(getComputedStyle(well).marginRight))
		}}
	>
	</button>
</div>
