import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import expressiveCode, { ExpressiveCodeTheme } from 'astro-expressive-code'
import { readFileSync } from 'node:fs'
import sectionize from 'remark-sectionize'

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
	theme: ExpressiveCodeTheme.fromJSONString(readFileSync('./vstheme.json', 'utf8')),
	styleOverrides: {
		uiFontSize: '0.75rem',
		uiFontFamily: 'Inter var',
		codeFontFamily: 'Fira Code VF',
		codeFontSize: '0.875rem',
		codePaddingBlock: '1.25rem',
		borderRadius: '0.75rem'
	},
	useThemedScrollbars: false,
	frames: {
		extractFileNameFromCode: false,
		styleOverrides: {
			terminalBackground: '#1e293b',
			terminalTitlebarDotsForeground: '#475569',
			terminalTitlebarBorderBottom: '#64748b4d',
			terminalTitlebarBackground: '#1e293b',
			inlineButtonBorder: '#494f66',
			inlineButtonForeground: '#94a3b8',
			tooltipSuccessBackground: '#0ea5e9',
			tooltipSuccessForeground: '#fff',
			inlineButtonHoverOrFocusBackground: '#33415580',
			editorBackground: '#1e293b',
			editorActiveTabForeground: '#7dd3fc',
			editorActiveTabBackground: '#1e293b',
			editorActiveTabBorder: '#64748b4d',
			editorTabBarBorderBottom: '#64748b4d',
			editorActiveTabBorderBottom: '#7dd3fc',
			editorTabBarBackground: '#33415580',
			editorTabBorderRadius: '0',
			frameBoxShadowCssValue: '0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a'
		}
	},
	textMarkers: {
		styleOverrides: {
			// lineMarkerAccentWidth: '0.25rem',
			markBackground: '#7dd3fc26',
			markBorderColor: '#38bdf8',
			insBackground: '#2dd4bf26',
			insDiffIndicatorColor: '#2dd4bf',
			insBorderColor: '#2dd4bf',
			delBackground: '#f43f5e26',
			delBorderColor: '#fb7185',
			delDiffIndicatorColor: '#fb7185'
		}
	}
}

export default defineConfig({
	srcDir: '.',
	outDir: '.astro/dist',
	markdown: {
		remarkPlugins: [sectionize]
	},
	integrations: [
		tailwind({
			applyBaseStyles: false
		}),
		svelte(),
		expressiveCode(codeOptions),
		mdx()
	]
})
