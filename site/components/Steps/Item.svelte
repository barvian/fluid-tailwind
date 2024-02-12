<li
    class="
        relative pl-10 my-0 lg:grid grid-cols-5 gap-16 before:content-[counter(step)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-[0.625rem] before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/5 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5
        not-last-of-type:pb-8 not-last-of-type:after:absolute not-last-of-type:after:top-[calc(1.875rem+1px)] not-last-of-type:after:bottom-0 not-last-of-type:after:left-[0.6875rem] not-last-of-type:after:w-px not-last-of-type:after:bg-slate-200 not-last-of-type:dark:after:bg-slate-200/5
    "
    style:counter-increment="step"
>
    <div class="prose prose-sm prose-slate dark:prose-invert [&_p:has(strong:only-child)]:mb-2 [&_p:has(strong:only-child)+p]:mt-0 mb-6 col-span-2 lg:mb-0 mt-0">
        <slot />
    </div>
    <div class="-ml-10 lg:ml-0 col-span-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        <slot name="code" />
    </div>
</li>