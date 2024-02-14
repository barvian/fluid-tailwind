import { expect, it } from 'bun:test'
import './matchers'
import { html, css, run } from './run'
import {
	defaultThemeFontSizeInRems,
	defaultThemeScreensInRems,
	fluidExtractor,
	fluidize
} from '../src'
import { type FluidConfig } from '../src'
import plugin from 'tailwindcss/plugin'
import { type PluginAPI } from 'tailwindcss/types/config'

it(`should be possible to use defaultTheme...InRems values`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<h1 class="~text-2xl/5xl"></h1>`
			}
		],
		theme: {
			fontSize: defaultThemeFontSizeInRems,
			screens: defaultThemeScreensInRems
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-2xl\/5xl {
			font-size: clamp(1.5rem, 0.43rem + 2.68vw, 3rem)
				/* fluid from 1.5rem at 40rem to 3rem at 96rem; passes WCAG SC 1.4.4 */;
			line-height: clamp(
				2rem,
				1.29rem + 1.79vw,
				3rem
			); /* fluid from 2rem at 40rem to 3rem at 96rem */
		}
	`)
})

it(`respects disabled core plugins`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/2"></div>`
			}
		],
		corePlugins: {
			padding: false
		}
	})
	expect(result.css).toMatchFormattedCss(css``)
})

it(`requires a change in values`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/1"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
})

it(`simplifies when start = end screen`, async () => {
	// Technically we can't throw here because they could change it with a variant
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/2"></div>`
			}
		],
		theme: {
			fluid: {
				defaultScreens: ['30rem']
			} satisfies FluidConfig,
			screens: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~p-1\/2 {
			padding: 0.25rem; /* fluid from 0.25rem at 30rem to 0.5rem at 30rem */
		}
	`)
})

it(`requires values with same units`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-[1px]/[2rem]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
})

it(`requires length literals`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-[1rem]/[calc(2rem)]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
})

it(`supports negative length literals`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~mt-[1rem]/[-2rem]"></div>`
			}
		],
		theme: {
			screens: {
				sm: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~mt-\[1rem\]\/\[-2rem\] {
			margin-top: clamp(
				-2rem,
				2.8rem + -6vw,
				1rem
			); /* fluid from 1rem at 30rem to -2rem at 80rem */
		}
	`)
})

it(`respects defaultScreens config`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/2"></div>`
			}
		],
		theme: {
			fluid: {
				defaultScreens: ['30rem', '80rem']
			} satisfies FluidConfig
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`supports custom separator and prefix`, async () => {
	const result = await run({
		content: {
			files: [
				{
					raw: html`<div class="~sm/lg_tw-~p-1/2"></div>`
				}
			],
			extract: fluidExtractor({ separator: '_', prefix: 'tw-' })
		},
		separator: '_',
		prefix: 'tw-',
		theme: {
			screens: {
				sm: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~sm\/lg_tw-\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

type MatchUtilOrComp = Extract<keyof PluginAPI, 'matchUtilities' | 'matchComponents'>
const testFluidize = (key: MatchUtilOrComp) => async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="test-p-1 ~test-p-1/2"></div>`
			}
		],
		plugins: [
			fluidize(
				plugin((api) => {
					api[key](
						{
							'test-p': (val) => ({
								padding: val
							})
						},
						{
							values: api.theme('padding')
						}
					)
				})
			)
		],
		theme: {
			screens: {
				sm: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.test-p-1 {
			padding: 0.25rem;
		}
		.\~test-p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
}
it(`supports fluidized utilities`, testFluidize('matchUtilities'))
it(`supports fluidized components`, testFluidize('matchComponents'))
