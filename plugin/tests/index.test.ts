import { expect } from '@jest/globals'
import { html, css, run } from './run'
import {
	defaultThemeFontSizeInRems,
	defaultThemeScreensInRems,
	fluidExtractor,
	fluidize
} from '../src'
import { type FluidConfig } from '../src'
import plugin from 'tailwindcss/plugin'

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

it(`supports missing start defaultScreen`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/2"></div>`
			}
		],
		theme: {
			fluid: {
				defaultContainers: [, '80rem']
			} satisfies FluidConfig,
			screens: {
				sm: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~p-1\/2 {
			padding: clamp(
				0.25rem,
				-∞rem + ∞vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 30rem */
		}
	`)
})

it(`supports missing end defaultScreen`, async () => {
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
			containers: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.14rem + 0.38vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 96rem */
		}
	`)
})

it(`supports custom prefix`, async () => {
	const result = await run({
		content: {
			files: [
				{
					raw: html`<div class="tw-~p-1/2"></div>`
				}
			],
			extract: fluidExtractor({ prefix: 'tw-' })
		},
		prefix: 'tw-',
		theme: {
			screens: {
				sm: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.tw-\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`supports custom separator`, async () => {
	const result = await run({
		content: {
			files: [
				{
					raw: html`<div class="~@_~p-1/2"></div>`
				}
			],
			extract: fluidExtractor({ separator: '_' })
		},
		separator: '_',
		theme: {
			containers: {
				sm: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@_\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`supports fluidized utilities`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="test-p-1 ~test-p-1/2"></div>`
			}
		],
		plugins: [
			fluidize(
				plugin(({ matchUtilities, theme }) => {
					matchUtilities(
						{
							'test-p': (val) => ({
								padding: val
							})
						},
						{
							values: theme('padding')
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
})
