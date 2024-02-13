import { expect, it } from 'bun:test'
import './matchers'
import { html, css, run } from './run'

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

it(`fails if ~ variant is used on non-fluid utility`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~:relative"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
})

it(`fails if ~ variant is used with same start/end screens`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<div class="~md/md:~p-1/2"></div>`
			}
		]
	})
	expect(result.css).toMatchFormattedCss(css``)
})
