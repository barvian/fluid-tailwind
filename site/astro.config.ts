import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import expressiveCode, { ExpressiveCodeTheme } from 'astro-expressive-code'
import { readFileSync } from 'node:fs'
import sectionize from 'remark-sectionize'
import vercel from '@astrojs/vercel'
import intersectingDirective from './directives/intersecting/register'

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
	theme: ExpressiveCodeTheme.fromJSONString(readFileSync('./vstheme.json', 'utf8')),
	styleOverrides: {
		uiFontSize: 'var(--text-xs)',
		uiFontFamily: 'var(--font-sans)',
		codeFontFamily: 'var(--font-mono)',
		codeFontSize: 'var(--text-sm)',
		codePaddingBlock: 'calc(var(--spacing)*5)',
		uiPaddingBlock: 'calc(var(--spacing)*2)',
		borderRadius: 'var(--rounded-xl)',
		borderWidth: '1px',
		frames: {
			terminalBackground: 'var(--color-slate-825)',
			terminalTitlebarDotsForeground: 'var(--color-slate-600)',
			terminalTitlebarDotsOpacity: '1',
			terminalTitlebarBorderBottomColor:
				'color-mix(in oklab, var(--color-slate-500) 30%, transparent)',
			terminalTitlebarBackground: 'var(--color-slate-825)',
			inlineButtonBorder: 'var(--color-slate-600)',
			inlineButtonForeground: 'var(--color-slate-400)',
			inlineButtonBackground: 'var(--color-slate-700)',
			inlineButtonBackgroundHoverOrFocusOpacity: '.5',
			tooltipSuccessBackground: 'var(--color-sky-500)',
			tooltipSuccessForeground: 'var(--color-white)',
			editorBackground: 'var(--color-slate-825)',
			editorActiveTabForeground: 'var(--color-sky-300)',
			editorActiveTabBackground: 'var(--color-slate-825)',
			editorActiveTabBorderColor: 'color-mix(in oklab, var(--color-slate-500) 30%, transparent)',
			editorTabBarBorderBottomColor: 'color-mix(in oklab, var(--color-slate-500) 30%, transparent)',
			editorActiveTabIndicatorBottomColor: 'var(--color-sky-300)',
			editorActiveTabIndicatorHeight: '1.5px',
			editorTabBarBackground: 'var(--color-slate-850)',
			editorTabBorderRadius: '0',
			frameBoxShadowCssValue: 'var(--shadow-md)'
		},
		textMarkers: {
			inlineMarkerBorderWidth: '0',
			markBackground: 'color-mix(in oklab, var(--color-sky-300) 15%, transparent)',
			markBorderColor: 'var(--colors-sky-400)',
			insBackground: 'color-mix(in oklab, var(--color-teal-400) 15%, transparent)',
			insDiffIndicatorColor: 'var(--colors-teal-400)',
			insBorderColor: 'var(--colors-teal-400)',
			delBackground: 'color-mix(in oklab, var(--color-rose-400) 15%, transparent)',
			delBorderColor: 'var(--colors-rose-400)',
			delDiffIndicatorColor: 'var(--colors-rose-400)'
		}
	},
	useThemedScrollbars: false,
	frames: {
		showCopyToClipboardButton: false,
		extractFileNameFromCode: false
	}
}

export default defineConfig({
	site: 'https://fluid.tw',
	srcDir: '.',
	markdown: {
		remarkPlugins: [sectionize]
	},
	integrations: [intersectingDirective(), svelte(), expressiveCode(codeOptions), mdx()],
	output: 'static',
	adapter: vercel({
		webAnalytics: {
			enabled: true
		}
	}),
	vite: {
		plugins: [tailwindcss()]
	}
})
