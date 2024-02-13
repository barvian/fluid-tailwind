import { expect } from '@jest/globals'
import { html, css, run } from './run'

it(`allows ~@container/container variant`, async () => {
	const result = await run({
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
	const result = await run({
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
	const result = await run({
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
	// TODO: file bug for erroneous container query
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

it(`allows ~/container variant`, async () => {
	const result = await run({
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
	const result = await run({
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
	const result = await run({
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
	const result = await run({
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
	const result = await run({
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
	const result = await run({
		content: [
			{
				raw: html`<div class="~@:relative"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
})
