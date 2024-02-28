import { defineConfig, squooshImageService } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import expressiveCode, { ExpressiveCodeTheme } from 'astro-expressive-code'
import { readFileSync } from 'node:fs'
import sectionize from 'remark-sectionize'
import vercel from '@astrojs/vercel/static'
import intersectingDirective from './directives/intersecting/register'

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
	theme: ExpressiveCodeTheme.fromJSONString(readFileSync('./vstheme.json', 'utf8')),
	styleOverrides: {
		uiFontSize: '0.75rem',
		uiFontFamily: 'Inter var',
		codeFontFamily: 'Fira Code VF',
		codeFontSize: '1rem',
		codePaddingBlock: '1.25rem',
		uiPaddingBlock: '0.5rem',
		borderRadius: '0.75rem',
		borderWidth: '1px',
		borderColor: 'rgba(255,255,255,0.08)',
		frames: {
			terminalBackground: '#1e293b',
			terminalTitlebarDotsForeground: '#475569',
			terminalTitlebarDotsOpacity: '1',
			terminalTitlebarBorderBottomColor: '#64748b4d',
			terminalTitlebarBackground: '#1e293b',
			inlineButtonBorder: '#494f66',
			inlineButtonForeground: '#94a3b8',
			inlineButtonBackground: '#334155',
			inlineButtonBackgroundHoverOrFocusOpacity: '.5',
			tooltipSuccessBackground: '#0ea5e9',
			tooltipSuccessForeground: '#fff',
			editorBackground: '#1e293b',
			editorActiveTabForeground: '#7dd3fc',
			editorActiveTabBackground: '#1e293b',
			editorActiveTabBorderColor: '#64748b4d',
			editorTabBarBorderBottomColor: '#64748b4d',
			editorActiveTabIndicatorBottomColor: '#7dd3fc',
			editorActiveTabIndicatorHeight: '1.5px',
			editorTabBarBackground: '#2b3447',
			editorTabBorderRadius: '0',
			frameBoxShadowCssValue: '0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a'
		},
		textMarkers: {
			inlineMarkerBorderWidth: '0',
			markBackground: '#7dd3fc26',
			markBorderColor: '#38bdf8',
			insBackground: '#2dd4bf26',
			insDiffIndicatorColor: '#2dd4bf',
			insBorderColor: '#2dd4bf',
			delBackground: '#f43f5e26',
			delBorderColor: '#fb7185',
			delDiffIndicatorColor: '#fb7185'
		}
	},
	useThemedScrollbars: false,
	frames: {
		showCopyToClipboardButton: false,
		extractFileNameFromCode: false
	}
}

export default defineConfig({
	srcDir: '.',
	markdown: {
		remarkPlugins: [sectionize]
	},
	integrations: [
		intersectingDirective(),
		tailwind({
			applyBaseStyles: false
		}),
		svelte(),
		expressiveCode(codeOptions),
		mdx()
	],
	image: {
		service: squooshImageService()
	},
	devToolbar: {
		enabled: false
	},
	output: 'static',
	adapter: vercel({
		webAnalytics: {
			enabled: true
		}
	})
})
