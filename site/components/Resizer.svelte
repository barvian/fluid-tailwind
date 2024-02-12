<script lang="ts">
	import { resize } from "/lib/actions"
    import { writable } from "svelte/store"
    import * as Tip from '/components/Tip'

    let margin = writable(0), resizing = writable(false)
    export let height = "h-auto"
    export let tooNarrowClass = "lg:hidden"
</script>

<Tip.Info class={tooNarrowClass}>Your browser isn't wide enough to see the full effect</Tip.Info>
<div class="relative -mb-8 max-w-full @container ~min-w-[16rem]/[24rem]">
    <div class="@container max-w-full rounded-t-xl border border-slate-900/5 bg-slate-50 dark:bg-slate-800/25 bg-grid-slate-100 dark:bg-grid-slate-700/25 overflow-hidden p-6 relative pb-10 box-content flex flex-col items-center justify-center {height}" style:margin-right="clamp(0px, {$margin}px, 50cqw)">
        <slot />
    </div>
    <button tabindex="-1" class="left-full touch-pan-y top-1/2 absolute group p-2 cursor-ew-resize -mt-6" aria-label="Resize" style:transform="translateX(clamp(-50cqw, {-$margin}px, 0px))" use:resize={{ direction: 'right', value: margin, resizing }}>
        <div class="rounded-full w-1.5 h-8 bg-slate-500/60 group-hover:bg-slate-500/80 {$resizing ? 'bg-slate-500/80' : ''}" />
    </button>
</div>