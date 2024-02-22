import { expect, it } from 'bun:test'
import './matchers'
import { html, css, run } from './run'
import { type FluidConfig } from '../src'

it(`allows ~@container/container variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@md/lg:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@md\/lg\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows ~@container variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@md:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@md\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows ~@container/[arbitrary] variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@md/[80rem]:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				md: '30rem'
			}
		}
	})
	// TODO: file bug for erroneous container query? I think this is on Tailwind's end
	// It should be fine to allow for now because [80rem] is an invalid container name:
	// https://developer.mozilla.org/en-US/docs/Web/CSS/@container#container-name
	expect(result.css).toMatchFormattedCss(css`
		.\~\@md\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
		@container [80rem] (min-width: 30rem) {
			.\@md\/\[80rem\]\:\~p-1\/2 {
				padding: clamp(
					0.25rem,
					0.07rem + 0.45vw,
					0.5rem
				); /* fluid from 0.25rem at 40rem to 0.5rem at 96rem */
			}
		}
	`)
})

it(`allows ~@/container variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@/lg:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				md: '30rem',
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\/lg\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows ~@/[arbitrary] variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@/[80rem]:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows ~@[arbitrary] variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@[30rem]:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\[30rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows ~@[arbitrary]/container variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@[30rem]/lg:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\[30rem\]\/lg\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows ~@[arbitrary]/[arbitrary] variant`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@[30rem]/[80rem]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\[30rem\]\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`fails if ~@ variant is used on non-fluid utility`, async () => {
	const { result, warn } = await run({
		content: [
			{
				raw: html`<div class="~@:relative"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
	expect(warn).toHaveBeenCalledWith(
		'no-utility',
		'~@: Fluid variants can only be used with fluid utilities'
	)
})

it(`respects defaultContainers config`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@:~p-1/2"></div>`
			}
		],
		theme: {
			fluid: {
				defaultContainers: ['30rem', '80rem']
			} satisfies FluidConfig
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`supports missing start defaultContainer`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@:~p-1/2"></div>`
			}
		],
		theme: {
			fluid: {
				defaultContainers: [, '80rem']
			} satisfies FluidConfig,
			containers: {
				sm: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`supports missing end defaultContainer`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@:~p-1/2"></div>`
			}
		],
		theme: {
			fluid: {
				defaultContainers: ['30rem']
			} satisfies FluidConfig,
			containers: {
				lg: '80rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.1rem + 0.5cqw,
				0.5rem
			); /* fluid from 0.25rem at 30rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`fails if ~@ variant is used with same start/end containers`, async () => {
	const { result, warn } = await run({
		content: [
			{
				raw: html`<div class="~@[30rem]/md:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				md: '30rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css``)
	expect(warn).toHaveBeenCalledWith('no-change-bp', '~@: Start and end breakpoints are both 30rem')
})

it(`fails if no containers`, async () => {
	const { result, warn } = await run({
		content: [
			{
				raw: html`<div class="~@:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {}
		}
	})
	expect(result.css).toMatchFormattedCss(``)
	expect(warn).toHaveBeenCalledWith(
		'missing-default-start-bp',
		'~@: Missing default start breakpoint'
	)
})

it(`fails if containers with different units`, async () => {
	const { result, warn } = await run({
		content: [
			{
				raw: html`<div class="~@:~p-1/2"></div>`
			}
		],
		theme: {
			containers: {
				sm: '30rem',
				lg: '960px'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(``)
	expect(warn).toHaveBeenCalledWith(
		'sort-mismatched-bp-units',
		'~@: Cannot sort simple breakpoints in `theme.containers` because they use different units'
	)
})

it(`allows zeroed start container`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@[0px]/[80rem]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\[0px\]\/\[80rem\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.25rem + 0.31cqw,
				0.5rem
			); /* fluid from 0.25rem at 0rem to 0.5rem at 80rem (container) */
		}
	`)
})

it(`allows zeroed end container`, async () => {
	const { result } = await run({
		content: [
			{
				raw: html`<div class="~@[80rem]/[0px]:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~\@\[80rem\]\/\[0px\]\:\~p-1\/2 {
			padding: clamp(
				0.25rem,
				0.5rem + -0.31cqw,
				0.5rem
			); /* fluid from 0.25rem at 80rem to 0.5rem at 0rem (container) */
		}
	`)
})
