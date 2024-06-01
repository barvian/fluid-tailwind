<script lang="ts">
	let cls = ''
	export { cls as class }
	export let cols = 'grid-cols-1'
	export let rows = 'grid-rows-[minmax(0,0.85fr)]'
	export let shadow = 'shadow-md'
</script>

<div
	class="{cls} grid {cols} {rows} {shadow} relative auto-rows-fr overflow-clip rounded-xl *:!m-0 dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:z-10 dark:after:size-full dark:after:rounded-xl dark:after:ring-1 dark:after:ring-inset dark:after:ring-slate-300/10 [&>.expressive-code+.expressive-code]:border-slate-300/20 [&>.expressive-code+.expressive-code]:shadow-[0_-1px_0_theme(colors.slate.300/.1)] [&>.expressive-code]:!h-full [&>.expressive-code_.frame]:!h-full [&>.expressive-code_.frame]:!shadow-none [&>.expressive-code_.frame]:after:!hidden [&>.expressive-code_:is(.frame,pre,.frame_.header)]:![border-radius:0]"
>
	<slot />
</div>
