import { expect, it } from 'bun:test'
import './matchers'
import { html, css, run } from './run'
import type { FluidThemeConfig } from '../dist'

it(`allows ~screen/screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md/lg:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\/lg\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~screen/[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md/[80rem]:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~/screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~/lg:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\/lg\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~/[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~/[80rem]:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~min-[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~min-[arbitrary]/screen variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]/lg:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\/lg\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows ~min-[arbitrary]/[arbitrary] variant`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]/[80rem]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5vw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem */
		}
	`)
})

it(`fails for different start/end screen units`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]/[10px]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\/\[10px\]\:\~p-1\/2 {
			/* error - Start breakpoint ${'`'}30rem${'`'} and end breakpoint ${'`'}10px${'`'} units don't match */
		}
	`)
})

it(`correctly handles errors with inside media queries`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[30rem]/[10px]:sm:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[30rem\]\/\[10px\]\:sm\:\~p-1\/2 {
			/* error - Start breakpoint ${'`'}30rem${'`'} and end breakpoint ${'`'}10px${'`'} units don't match */
		}
	`)
})

it(`fails if ~ variant is used on non-fluid utility`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~:relative"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\:relative {
			/* error - Fluid variants can only be used with fluid utilities */
		}
	`)
})

it(`re-presents error if ~ variant is used on failed fluid utility`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~:~p-[3px]/[3rem]"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\:\~p-\[3px\]\/\[3rem\] {
			/* error - Start ${'`'}3px${'`'} and end ${'`'}3rem${'`'} units don't match */
		}
	`)
})

it(`fails if ~ variant is used with same start/end screens`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md/[30rem]:~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~md\/\[30rem\]\:\~p-1\/2 {
			/* error - Start and end breakpoints are both ${'`'}30rem${'`'} */
		}
	`)
})

it(`fails if no screens`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/2"></div>`
			}
		],
		theme: {
			screens: {}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~p-1\/2 /* error - Missing default start breakpoint */ {
		}
	`)
})

it(`fails if screens with different units`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~p-1/2"></div>`
			}
		],
		theme: {
			screens: {
				sm: '30rem',
				lg: '960px'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~p-1\/2 /* error - Cannot sort simple breakpoints in ${'`'}theme.screens${'`'} because they use different units */ {
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
				defaultScreens: [, '80rem']
			} satisfies FluidThemeConfig,
			screens: {
				sm: '30rem'
			}
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
			} satisfies FluidThemeConfig,
			screens: {
				lg: '80rem'
			}
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

it(`allows zeroed start screen`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[0px]/[80rem]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[0px\]\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.25rem + 0.31vw,
				0.5rem
			); /* fluid from 0.25rem at 0rem to 0.5rem at 80rem */
		}
	`)
})

it(`allows zeroed end screen`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[80rem]/[0px]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[80rem\]\/\[0px\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.5rem + -0.31vw,
				0.5rem
			); /* fluid from 0.25rem at 80rem to 0.5rem at 0rem */
		}
	`)
})

it(`works with complex utilities like space-y`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~min-[10rem]/[20rem]:~space-y-4/8"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~min-\[10rem\]\/\[20rem\]\:\~space-y-4\/8 > :not([hidden]) ~ :not([hidden]) {
			--tw-space-y-reverse: 0;
			margin-top: calc(
				clamp(1rem, 0rem + 10vw, 2rem) /* fluid from 1rem at 10rem to 2rem at 20rem */ *
					calc(1 - var(--tw-space-y-reverse))
			);
			margin-bottom: calc(
				clamp(1rem, 0rem + 10vw, 2rem) /* fluid from 1rem at 10rem to 2rem at 20rem */ *
					var(--tw-space-y-reverse)
			);
		}
	`)
})
