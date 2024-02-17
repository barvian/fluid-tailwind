import { expect, it } from 'bun:test'
import './matchers'
import { html, css, run } from './run'

it(`respects ~text from DEFAULT`, async () => {
	const { result } = await run({
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
				/* fluid from 1.25rem at 40rem to 1.875rem at 96rem; passes WCAG SC 1.4.4 */;
			line-height: clamp(
				2rem,
				1.82rem + 0.45vw,
				2.25rem
			); /* fluid from 2rem at 40rem to 2.25rem at 96rem */
		}
	`)
})

it(`respects ~text to DEFAULT`, async () => {
	const { result } = await run({
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
				/* fluid from 1.875rem at 40rem to 1.25rem at 96rem; passes WCAG SC 1.4.4 */;
			line-height: clamp(
				2rem,
				2.43rem + -0.45vw,
				2.25rem
			); /* fluid from 2.25rem at 40rem to 2rem at 96rem */
		}
	`)
})

it(`fails for SC 1.4.4 violations`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~text-[1rem]/[2.6rem]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-\[1rem\]\/\[2\.6rem\] {
			font-size:; /* not fluid from 1rem at 40rem to 2.6rem at 96rem; fails WCAG SC 1.4.4 at i.e. 200rem */
		}
	`)
})

it(`allows variants to fix SC 1.4.4 violations`, async () => {
	const { result } = await run({
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
			); /* fluid from 1rem at 0.5rem to 2.6rem at 120rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`handles simple font sizes`, async () => {
	const { result } = await run({
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
			); /* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`applies consistent line height`, async () => {
	const { result } = await run({
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
				/* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */;
			line-height: 1.5;
		}
	`)
})

it(`fails for inconsistent line height`, async () => {
	const { result, warn } = await run({
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
			); /* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */
		}
	`)
	expect(warn).toHaveBeenCalledWith(
		'non-length-start',
		'~text: Line height: Start value `1.5` is not a length'
	)
})

it(`applies consistent font weight`, async () => {
	const { result } = await run({
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
				/* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */;
			font-weight: 600;
		}
	`)
})

it(`handles string <-> number font weight`, async () => {
	const { result } = await run({
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
				/* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */;
			font-weight: 600;
		}
	`)
})

it(`fails for inconsistent font weights`, async () => {
	const { result, warn } = await run({
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
			); /* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */
		}
	`)
	expect(warn).toHaveBeenCalledWith('mismatched-font-weights', '~text: Mismatched font weights')
})

it(`fluidizes compatible letter spacing`, async () => {
	const { result } = await run({
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
				/* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */;
			letter-spacing: clamp(
				0.1rem,
				0.03rem + 0.18vw,
				0.2rem
			); /* fluid from 0.1rem at 40rem to 0.2rem at 96rem */
		}
	`)
})

it(`applies consistent letter spacing`, async () => {
	const { result } = await run({
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
				/* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */;
			letter-spacing: 0.2em;
		}
	`)
})

it(`doesn't apply inconsistent letter spacing`, async () => {
	const { result } = await run({
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
				/* fluid from 1rem at 40rem to 2rem at 96rem; passes WCAG SC 1.4.4 */;
			letter-spacing:; /* fluid from 0.3em at 40rem to 0.2em at 96rem */
		}
	`)
})
