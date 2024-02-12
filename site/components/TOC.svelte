<script lang="ts">
	import type { MarkdownHeading } from "astro"
	import { onMount } from "svelte"

    export let headings: MarkdownHeading[]
    headings = headings.filter(h => h.depth <= 2) // only include h2s

    let isActive = Object.fromEntries(headings.map(h => [h.slug, false]))
    onMount(() => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                const slug = (e.target as HTMLElement).dataset.slug!
                isActive[slug] = e.isIntersecting
            })
        }, {
            rootMargin: '-40% 0% -60%' // a little sliver at the middle of the viewport
        })
        headings.forEach((heading) => {
            const section = document.getElementById(heading.slug)!.closest('section')!
            section.dataset.slug = heading.slug
            io.observe(section)
        })

        return io.disconnect
    })
</script>

<ul class="space-y-2 border-l text-sm/6 border-slate-100 dark:border-slate-700">
    {#each headings as heading}
        <li aria-level={heading.depth-1}>
            <a href="#{heading.slug}" class="block border-l {heading.depth === 2 ? 'pl-4' : 'pl-6'} -ml-px {isActive[heading.slug] ? 'text-sky-500 font-semibold border-current dark:text-sky-400' : 'border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'}">
                {heading.text}
            </a>
        </li>
    {/each}
</ul>