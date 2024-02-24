<script lang="ts">
	let cls = ''
	export { cls as class }
	export let cols = 'grid-cols-1'
	export let rows = 'grid-rows-[minmax(0,0.85fr)]'
	export let shadow = 'shadow-md'
</script>

<div
	class="{cls} grid {cols} {rows} {shadow} auto-rows-fr overflow-clip rounded-xl *:!m-0 [&>.expressive-code+.expressive-code]:[border-top:1px_solid_rgb(54,62,80)] [&>.expressive-code]:!h-full [&>.expressive-code_.frame]:!h-full [&>.expressive-code_.frame]:!shadow-none [&>.expressive-code_:is(.frame,pre,.frame_.header)]:![border-radius:0]"
>
	<slot />
</div>
