<div class="not-prose my-6 flex items-start space-x-4">
	<div
		class="relative mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-white ring-2 ring-rose-400 dark:bg-red-400 dark:ring-red-400"
	>
		<svg width="6" height="6" class="overflow-visible" aria-hidden="true">
			<path
				d="M0 0L6 6M6 0L0 6"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<div
			class="absolute left-[0.46875rem] top-full mt-1 h-[1.375rem] w-px rounded-full bg-rose-200 dark:bg-red-200/25"
		/>
	</div>
	<p class="m-0 max-w-prose flex-1 text-base font-semibold text-slate-900 dark:text-slate-200">
		<slot />
	</p>
</div>
