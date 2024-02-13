import { expect } from '@jest/globals'
import { html, css, run } from './run'
import { defaultThemeFontSizeInRems, defaultThemeScreensInRems } from '../src'

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
