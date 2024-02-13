import { expect, it } from 'bun:test'
import './matchers'
import { html, css, run } from './run'

it(`respects ~text from DEFAULT`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~text/3xl"></div>`
			}
		],
		theme: {
			extend: {
				fontSize: {
					DEFAULT: ['1.25rem', '2rem']
				}
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
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-3xl"></div>`
			}
		],
		theme: {
			extend: {
				fontSize: {
					DEFAULT: ['1.25rem', '2rem']
				}
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
	const result = await run({
		content: [
			{
				raw: html`<div class="~text-[1rem]/[2.6rem]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-\[1rem\]\/\[2\.6rem\] {
			font-size: 1rem; /* not fluid from 1rem at 40rem to 2.6rem at 96rem; fails WCAG SC 1.4.4 at i.e. 200rem */
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
			); /* fluid from 1rem at 0.5rem to 2.6rem at 120rem; passes WCAG SC 1.4.4 */
		}
	`)
})
