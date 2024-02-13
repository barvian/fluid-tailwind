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

it(`should not output intercept if it's 0`, async () => {
	const result = await run({
		content: [
			{
				raw: html`<h1 class="~text-lg/5xl"></h1>`
			}
		],
		theme: {
			fontSize: {
				lg: '1.25rem',
				'5xl': '3rem'
			},
			screens: {
				sm: '40rem',
				xl: '96rem'
			}
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-lg\/5xl {
			font-size: clamp(
				1.25rem,
				3.13vw,
				3rem
			); /* fluid from 1.25rem at 40rem to 3rem at 96rem; passes WCAG SC 1.4.4 */
		}
	`)
})
