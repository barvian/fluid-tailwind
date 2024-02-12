<script lang="ts">
    let cls =''
    export { cls as class }
    export let cols = 'grid-cols-1'
    export let rows = 'grid-rows-[minmax(0,0.85fr)]'
</script>
<div class="{cls} grid {cols} {rows} auto-rows-fr [&>*]:!m-0 [&>.ec+.ec]:[border-top:1px_solid_rgb(54,62,80)] [&>.ec]:!h-full [&>.ec_.frame]:!h-full [&>.ec_.frame]:!rounded-none rounded-xl overflow-hidden">
    <slot />
</div>