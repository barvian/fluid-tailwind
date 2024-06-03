<div class="my-6 flex items-start space-x-4">
	<div
		class="relative mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-white ring-2 ring-rose-400"
		aria-label="Bad"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			class="size-3"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6 18 18 6M6 6l12 12"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
		<div
			class="absolute left-[0.46875rem] top-full mt-1 h-6 w-px rounded-full bg-rose-200 dark:bg-rose-200/25"
		/>
	</div>
	<p class="m-0 flex-1 text-base font-semibold text-slate-900 dark:text-slate-200">
		<slot />
	</p>
</div>
