import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import typography from '@tailwindcss/typography'
import containerQueries from '@tailwindcss/container-queries'
import { sans, mono } from './theme'
import fluid, {
	extract,
	screens as _screens,
	fontSize,
	type FluidThemeConfig
} from 'fluid-tailwind'
const { '2xl': _, ...screens } = _screens
import svgToDataUri from 'mini-svg-data-uri'
// @ts-expect-error undocumented API
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export default {
	experimental: {
		optimizeUniversalDefaults: true
	},
	corePlugins: {
		ringOpacity: false,
		textOpacity: false,
		borderOpacity: false,
		divideOpacity: false,
		backdropOpacity: false,
		backgroundOpacity: false,
		placeholderOpacity: false
	},
	content: {
		files: ['./{pages,layouts,components}/**/*.{html,js,svelte,ts,astro,mdx}'],
		transform: {
			mdx: (src) =>
				src
					// Ignore classes in code blocks
					.replaceAll(/```.*?```/gs, '')
					// Only return stuff in <component>s
					.match(/<[^/].*?>/g)
					?.join() ?? ''
		},
		extract
	},
	corePlugins: {
		container: false
	},
	theme: {
		fontSize,
		screens: {
			xs: '30rem',
			...screens
		},
		extend: {
			animation: {
				parallax: 'parallax linear both'
			},
			keyframes: {
				parallax: {
					to: {
						transform: 'translateY(clamp(-5rem,-10vh,-2.5rem))'
					}
				}
			},
			borderColor: {
				DEFAULT: 'currentColor'
			},
			colors: {
				slate: {
					850: '#162032'
					// 900: '#0e1526'
				}
			},
			spacing: {
				'4.5': '1.125rem'
			},
			fontFamily: {
				sans,
				mono
			},
			fontSize: {
				// '6xl': ['4rem', '4rem']
			},
			backgroundImage: {
				grid: `radial-gradient(circle, rgba(250,250, 250, 0.0), #fafafa), url("data:image/svg+xml,%3Csvg id='patternId' width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='hsla(0, 0%25, 100%25, 0)'/%3E%3Cpath d='M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z' stroke-width='0.5' stroke='hsla(0, 0%25, 0%25, 0.015)' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='800%25' height='800%25' transform='translate(0,0)' fill='url(%23a)'/%3E%3C/svg%3E")`,
				gradients: `radial-gradient(38.61% 47.1% at 41.44% 51.75%, theme('colors.green.300' / 20%) 0%, theme('colors.green.300' / 0%) 100%), radial-gradient(23.53% 56.72% at 37.45% 68.12%, theme('colors.pink.300' / 50%) 0%, theme('colors.pink.300' / 0%) 100%), radial-gradient(33.67% 28.07% at 73.67% 49.32%, theme('colors.blue.300') 0%, theme('colors.blue.300' / 20%) 100%)`,
				fluid: `url('./fluid.jpg')`
			},
			fluid: {} satisfies FluidThemeConfig,
			transitionTimingFunction: {
				'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
				'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
				'in-out-quad': 'cubic-bezier(0.65, 0, 0.35, 1)',
				'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
				'out-quad': 'cubic-bezier(0.5, 1, 0.89, 1)',
				'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
				'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)'
			},
			supports: {
				sda: 'timeline-scope: none'
			},
			typography: {
				DEFAULT: {
					css: {
						'&>section': {
							'@apply py-12 first:pt-0 last:pb-0': {}
						},
						'&>section>:first-child': {
							'margin-top': '0 !important'
						},
						'&>section>:last-child,&>section>section:last-child>:last-child': {
							'margin-bottom': '0 !important'
						},
						'>section + section': {
							'@apply border-t border-slate-100': {}
						},
						a: {
							'@apply font-semibold decoration-[1px] hover:decoration-[1.5px] underline-offset-[0.125em]':
								{}
						},
						h3: {
							'margin-top': '2.4em'
						},
						h4: {
							//'font-size': '1.125em',
							'margin-top': '2.4em'
						},
						'p,ul,ol': {
							'@apply max-w-prose': {}
						},
						'ul,ol': {
							'@apply space-y-[0.5em]': {}
						},
						'ul > li, ol > li': {
							'@apply my-0': {}
						},
						'.expressive-code': {
							'@apply z-10 mt-5 mb-8': {}
						},
						'.expressive-code+[data-info]': {
							'@apply -mt-3': {}
						}
					}
				},
				invert: {
					css: {
						'>section + section': {
							'@apply border-slate-800': {}
						}
					}
				}
			}
		}
	},
	plugins: [
		fluid,
		typography,
		containerQueries,
		plugin(({ addVariant, matchUtilities, theme }) => {
			addVariant('current', '&[aria-current="page"]')
			addVariant('group-current', ':merge(.group)[aria-current="page"] &')
			addVariant('aria-hidden', '&[aria-hidden="true"]')
			addVariant('js', '[data-js]:root &')
			addVariant('no-js', ':root:not([data-js]) &')
			addVariant('not-last-of-type', '&:not(:last-of-type)')
			addVariant('not-first-of-type', '&:not(:first-of-type)')
			addVariant('group-not-last-of-type', ':merge(.group):not(:last-of-type) &')
			addVariant('group-not-first-of-type', ':merge(.group):not(:first-of-type) &')
			addVariant('fonts-loaded', [':root:not([data-js]) &', '[data-fonts-loaded]:root &'])

			matchUtilities(
				{
					'bg-grid': (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
						)}")`
					})
				},
				{ values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
			)
		})
	]
} satisfies Config
