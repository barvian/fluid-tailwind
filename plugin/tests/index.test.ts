import { expect } from '@jest/globals'
import { html, css, run } from './run'
import { defaultThemeFontSizeInRems, defaultThemeScreensInRems } from '../src'
import { type Config } from 'tailwindcss'

it('should be possible to use defaultTheme...InRems values', async () => {
	const result = await run({
		content: [
			{
				raw: html`<h1 class="~text-xl/5xl"></h1>`
			}
		],
		theme: {
			fontSize: defaultThemeFontSizeInRems,
			screens: defaultThemeScreensInRems
		}
	})
	expect(result.css).toMatchFormattedCss(css`
		.\~text-xl\/5xl {
			font-size: clamp(1.25rem, 0rem + 3.13vw, 3rem)
				/* fluid from 1.25rem at 40rem to 3rem at 96rem; passes WCAG SC 1.4.4 */;
			line-height: clamp(
				1.75rem,
				0.86rem + 2.23vw,
				3rem
			); /* fluid from 1.75rem at 40rem to 3rem at 96rem */
		}
	`)
})
