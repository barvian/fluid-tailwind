import { expect } from '@jest/globals'
import { html, css, run } from './run'

it(`allows ~screen/screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md/lg:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\/lg\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~screen/[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md/[80rem]:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\/\[80rem\]\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~/screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~/lg:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\/lg\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~/[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~/[80rem]:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\/\[80rem\]\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~min-[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~min-[arbitrary]/screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]/lg:~text-sm/lg"></div>`
			}
		],
		theme: {
			fontSize: {
				sm: '1rem',
				lg: '2rem'
			},
			screens: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\/lg\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})

it(`allows ~min-[arbitrary]/[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]/[80rem]:~text-sm/lg"></div>`
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
		.\~min-\[30rem\]\/\[80rem\]\:\~text-sm\/lg {
			font-size: clamp(
				1rem,
				0.4rem + 2vw,
				2rem
			); /* fluid from 1rem at 30rem to 2rem at 80rem; passes WCAG SC 1.4.4 */
		}
	`)
})
