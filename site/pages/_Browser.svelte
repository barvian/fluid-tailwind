<script lang="ts">
	import { resize } from '/lib/actions'
	import { onMount } from 'svelte'
	import { cubicOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'
	import { writable } from 'svelte/store'
	import { fade } from 'svelte/transition'

	let cls = ''
	export { cls as class }
	export let minWidth = '23.75rem'

	let resizable: HTMLDivElement

	let margin = tweened(0, { duration: 700, easing: cubicOut }),
		resizing = writable(false)
	let showCursor = false,
		animating = false,
		didAnimate = false

	onMount(() => {
		setTimeout(() => (showCursor = true), 0)
		setTimeout(() => (animating = true), 100) // wait to show the pressed cursor state
		setTimeout(async () => {
			await margin.set(23) // biggest value, in rems
			animating = showCursor = false
			didAnimate = true
			// Convert to pixels
			margin.set(parseFloat(getComputedStyle(resizable).marginRight), {
				duration: 0,
				delay: 0
			})
		}, 100 /* initial delay */ + 250 /* another delay, accounting for cursor press transition */)
	})
</script>

<div class="{cls} @container pointer-events-none h-full" role="presentation">
	<div
		bind:this={resizable}
		class="@container pointer-events-auto relative h-full rounded-xl bg-white shadow-xl ring-1 ring-inset ring-white/10 dark:bg-slate-800"
		style:margin-right="clamp(0px, {$margin}{didAnimate ? 'px' : 'rem'}, 100cqw - {minWidth})"
	>
		<div class="flex h-full flex-col items-stretch rounded-xl ring-1 ring-slate-900/5">
			<!-- Toolbar -->
			<div
				class="grid items-center gap-6 px-4 py-2.5"
				style="grid-template-columns: 2.625rem 1fr 2.625rem;"
			>
				<div class="flex items-center">
					<div class="h-2.5 w-2.5 rounded-full bg-[#EC6A5F]"></div>
					<div class="ml-1.5 h-2.5 w-2.5 rounded-full bg-[#F4BF50]"></div>
					<div class="ml-1.5 h-2.5 w-2.5 rounded-full bg-[#61C454]"></div>
				</div>
				<div>
					<div
						class="mx-auto flex w-4/5 items-center justify-center rounded-md bg-slate-200 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-500"
					>
						<svg
							viewBox="0 0 20 20"
							fill="currentColor"
							class="mr-1.5 h-3.5 w-3.5 text-slate-500 dark:text-slate-500"
						>
							<path
								fill-rule="evenodd"
								d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
								clip-rule="evenodd"
							></path>
						</svg>localhost
					</div>
				</div>
				<div class="flex justify-end">
					<svg
						class="h-4.5 text-slate-500 dark:text-slate-600"
						stroke="currentColor"
						viewBox="0 0 18 17"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M5 13H2.5C1.67157 13 1 12.3284 1 11.5V2.5C1 1.67157 1.67157 1 2.5 1H11.5C12.3284 1 13 1.67157 13 2.5V4"
							stroke-width="1.25"
							vector-effect="non-scaling-stroke"
						/>
						<rect
							x="5"
							y="4"
							width="12"
							height="12"
							rx="1.5"
							stroke-width="1.25"
							vector-effect="non-scaling-stroke"
						/>
					</svg>
				</div>
			</div>
			<!-- Viewport -->
			<div class="relative flex-1 overflow-hidden rounded-b-xl pb-8">
				<slot />
			</div>
		</div>
		{#if showCursor}
			<!-- Fake pointer for intro animation -->
			<div
				transition:fade={{ duration: 200 }}
				class="absolute -right-3.5 top-1/2 -mt-3.5 h-7 w-7 rounded-[100%] border-2 border-white/50 bg-black/50 transition"
				class:opacity-50={!animating}
				class:scale-[85%]={animating}
			/>
		{/if}
		{#if didAnimate}
			<button
				tabindex="-1"
				draggable="false"
				class="group absolute left-full top-0 flex h-full cursor-ew-resize touch-pan-y items-center justify-center px-2"
				aria-label="Resize"
				in:fade={{ duration: 200, delay: 100 }}
				use:resize={{
					direction: 'right',
					value: margin,
					resizing,
					onStop: () =>
						margin.set(parseFloat(getComputedStyle(resizable).marginRight), {
							duration: 0,
							delay: 0
						})
				}}
			>
				<div class="h-8 w-1.5 rounded-full bg-slate-500/60 group-hover:bg-slate-500/80" />
			</button>
		{/if}
	</div>
</div>
