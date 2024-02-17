import type { ClientDirective, ClientVisibleOptions } from 'astro'

type ClientIntersectingOptions = Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'>

declare module 'astro' {
	interface AstroClientDirectives {
		'client:intersecting'?: ClientIntersectingOptions
	}
}

/**
 * Hydrate this component when one of it's children becomes visible
 * We target the children because `astro-island` is set to `display: contents`
 * which doesn't work with IntersectionObserver
 */
export default ((load, options, el) => {
	const cb = async () => {
		const hydrate = await load()
		await hydrate()
	}

	const ioOptions =
		typeof options.value === 'object' ? (options.value as ClientVisibleOptions) : undefined

	const io = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue
			// As soon as we hydrate, disconnect this IntersectionObserver for every `astro-island`
			io.disconnect()
			cb()
			break // break loop on first match
		}
	}, ioOptions)

	// TODO: warn if they're using threshold with more than one child
	for (const child of el.children) {
		io.observe(child)
	}
}) satisfies ClientDirective
