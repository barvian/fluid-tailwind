import { expect, it, spyOn } from 'bun:test'
import './matchers'
import { html, css, run } from './run'
import colors from 'picocolors'
import fluid from '../src'

const warn = spyOn(console, 'warn')

it(`respects ~text from DEFAULT`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text/3xl"></div>`
			}
		],
		theme: {
			fontSize: {
				DEFAULT: ['1.25rem', '2rem'],
				'3xl': ['1.875rem', '2.25rem']
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text\/3xl {
			font-size: clamp(1.25rem, 0.804rem + 1.116vw, 1.875rem)
				/* fluid type from 1.25rem at 40rem to 1.875rem at 96rem */;
			line-height: clamp(
				2rem,
				1.82rem + 0.45vw,
				2.25rem
			); /* fluid from 2rem at 40rem to 2.25rem at 96rem */
		}
	`)
})

it(`respects ~text to DEFAULT`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-3xl"></div>`
			}
		],
		theme: {
			fontSize: {
				DEFAULT: ['1.25rem', '2rem'],
				'3xl': ['1.875rem', '2.25rem']
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-3xl {
			font-size: clamp(1.25rem, 2.321rem + -1.116vw, 1.875rem)
				/* fluid type from 1.875rem at 40rem to 1.25rem at 96rem */;
			line-height: clamp(
				2rem,
				2.43rem + -0.45vw,
				2.25rem
			); /* fluid from 2.25rem at 40rem to 2rem at 96rem */
		}
	`)
})

it(`fails for SC 1.4.4 violations`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-[1rem]/[2.6rem]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-\[1rem\]\/\[2\.6rem\] {
			font-size:; /* not fluid type from 1rem at 40rem to 2.6rem at 96rem: Fails WCAG SC 1.4.4 at i.e. 200rem */
		}
	`)
})

it(`allows variants to fix SC 1.4.4 violations`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[0.5rem]/[120rem]:~text-[1rem]/[2.6rem]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[0\.5rem\]\/\[120rem\]\:\~text-\[1rem\]\/\[2\.6rem\] {
			font-size: clamp(
				1rem,
				0.99rem + 1.34vw,
				2.6rem
			); /* fluid type from 1rem at 0.5rem to 2.6rem at 120rem */
		}
	`)
})

it(`reports SC 1.4.4 violations caused by variants`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[20rem]/[40rem]:~text-[1rem]/[2.6rem]"></div>`
			}
		],
		theme: {
			screens: {
				sm: '0.5rem',
				lg: '120rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css``)
	expect(warn).toHaveBeenCalledWith(
		colors.bold(colors.yellow('warn')),
		'-',
		colors.bold('~min-[20rem]/[40rem]:~text-[1rem]/[2.6rem]') + ':',
		'Fails WCAG SC 1.4.4 at i.e. 100rem'
	)
})

it(`allows warnings for WCAG SC 1.4.4 violations`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-[0.5rem]/[3rem]"></div>`
			}
		],
		plugins: [
			fluid({
				checkSC144: false
			})
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-\[0\.5rem\]\/\[3rem\] {
			font-size: clamp(
				0.5rem,
				-1.29rem + 4.46vw,
				3rem
			); /* fluid type from 0.5rem at 40rem to 3rem at 96rem */
		}
	`)
})

it(`handles simple font sizes`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.29rem + 1.79vw,
				2rem
			); /* fluid type from 1rem at 40rem to 2rem at 96rem */
		}
	`)
})

it(`applies consistent line height`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', '1.5'],
				lg: ['2rem', '1.5']
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(1rem, 0.29rem + 1.79vw, 2rem)
				/* fluid type from 1rem at 40rem to 2rem at 96rem */;
			line-height: 1.5;
		}
	`)
})

it(`can be overridden by ~leading`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg ~leading-3/4"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(0.875rem, 0.696rem + 0.446vw, 1.125rem)
				/* fluid type from 0.875rem at 40rem to 1.125rem at 96rem */;
			line-height: clamp(
				1.25rem,
				0.89rem + 0.89vw,
				1.75rem
			); /* fluid from 1.25rem at 40rem to 1.75rem at 96rem */
		}
		.\~leading-3\/4 {
			line-height: clamp(
				0.75rem,
				0.57rem + 0.45vw,
				1rem
			); /* fluid from 0.75rem at 40rem to 1rem at 96rem */
		}
	`)
})

it(`fails for inconsistent line height`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', '1.5'],
				lg: ['2rem', '1.8']
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.29rem + 1.79vw,
				2rem
			); /* fluid type from 1rem at 40rem to 2rem at 96rem */
		}
	`)
	expect(warn).toHaveBeenCalledWith(
		colors.bold(colors.yellow('warn')),
		'-',
		colors.bold('~text: Line height') + ':',
		'Start value `1.5` is not a length'
	)
})

it(`applies consistent font weight`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { fontWeight: 600 }],
				lg: ['2rem', { fontWeight: 600 }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(1rem, 0.29rem + 1.79vw, 2rem)
				/* fluid type from 1rem at 40rem to 2rem at 96rem */;
			font-weight: 600;
		}
	`)
})

it(`handles string <-> number font weight`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { fontWeight: 600 }],
				lg: ['2rem', { fontWeight: '600' }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(1rem, 0.29rem + 1.79vw, 2rem)
				/* fluid type from 1rem at 40rem to 2rem at 96rem */;
			font-weight: 600;
		}
	`)
})

it(`fails for inconsistent font weights`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { fontWeight: 600 }],
				lg: ['2rem', { fontWeight: 500 }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.29rem + 1.79vw,
				2rem
			); /* fluid type from 1rem at 40rem to 2rem at 96rem */
		}
	`)
	expect(warn).toHaveBeenCalledWith(
		colors.bold(colors.yellow('warn')),
		'-',
		colors.bold('~text') + ':',
		'Mismatched font weights'
	)
})

it(`fluidizes compatible letter spacing`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { letterSpacing: '0.1rem' }],
				lg: ['2rem', { letterSpacing: '0.2rem' }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(1rem, 0.29rem + 1.79vw, 2rem)
				/* fluid type from 1rem at 40rem to 2rem at 96rem */;
			letter-spacing: clamp(
				0.1rem,
				0.03rem + 0.18vw,
				0.2rem
			); /* fluid from 0.1rem at 40rem to 0.2rem at 96rem */
		}
	`)
})

it(`applies consistent letter spacing`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { letterSpacing: '0.2em' }],
				lg: ['2rem', { letterSpacing: '0.2em' }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(1rem, 0.29rem + 1.79vw, 2rem)
				/* fluid type from 1rem at 40rem to 2rem at 96rem */;
			letter-spacing: 0.2em;
		}
	`)
})

it(`doesn't apply inconsistent letter spacing`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { letterSpacing: '0.3em' }],
				lg: ['2rem', { letterSpacing: '0.2em' }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size: clamp(1rem, 0.29rem + 1.79vw, 2rem)
				/* fluid type from 1rem at 40rem to 2rem at 96rem */;
			letter-spacing:; /* not fluid from 0.3em at 40rem to 0.2em at 96rem: Breakpoint and value units don't match */
		}
	`)
})

it(`outputs nothing if font-size errors`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: ['1rem', { lineHeight: '1rem', fontWeight: 600, letterSpacing: '.01rem' }],
				lg: ['6rem', { lineHeight: '6rem', fontWeight: 600, letterSpacing: '0.02rem' }]
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-sm\/lg {
			font-size:; /* not fluid type from 1rem at 40rem to 6rem at 96rem: Fails WCAG SC 1.4.4 at i.e. 200rem */
		}
	`)
})
