import type { AstroIntegration } from 'astro'

export default () =>
	({
		name: 'client:intersecting',
		hooks: {
			'astro:config:setup'({ addClientDirective }) {
				addClientDirective({
					name: 'intersecting',
					entrypoint: './directives/intersecting/index.ts'
				})
			}
		}
	}) satisfies AstroIntegration
