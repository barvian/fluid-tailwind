<div class="flex items-start my-6 space-x-4">
<div class="relative mt-1 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center ring-2 ring-cyan-500 dark:bg-sky-500 dark:ring-sky-500">
    <svg width="6" height="4.5" class="overflow-visible" aria-hidden="true">
    <path
        d="M6 0L2 4.5L0 2.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    </svg>
    <div class="absolute top-full mt-1 left-[0.46875rem] w-px h-[1.375rem] bg-cyan-500/30 rounded-full dark:bg-sky-400/30" />
</div>
<p class="m-0 flex-1 text-base font-semibold text-slate-900 dark:text-slate-200">
    <slot />
</p>
</div>