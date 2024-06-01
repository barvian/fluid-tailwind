import { defineConfig, squooshImageService } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import expressiveCode, { ExpressiveCodeTheme } from 'astro-expressive-code'
import { readFileSync } from 'node:fs'
import sectionize from 'remark-sectionize'
import vercel from '@astrojs/vercel/static'
import intersectingDirective from './directives/intersecting/register'
import config from './tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'
const {
	theme: { colors, fontFamily }
} = resolveConfig(config)

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
	theme: ExpressiveCodeTheme.fromJSONString(readFileSync('./vstheme.json', 'utf8')),
	styleOverrides: {
		uiFontSize: '0.75rem',
		uiFontFamily: fontFamily.sans.join(', '),
		codeFontFamily: fontFamily.mono.join(', '),
		codeFontSize: '0.875rem',
		codePaddingBlock: '1.25rem',
		uiPaddingBlock: '0.5rem',
		borderRadius: '0.75rem',
		borderWidth: '1px',
		frames: {
			terminalBackground: colors.slate['825'],
			terminalTitlebarDotsForeground: colors.slate['600'],
			terminalTitlebarDotsOpacity: '1',
			terminalTitlebarBorderBottomColor: `${colors.slate['500']}4d`,
			terminalTitlebarBackground: colors.slate['825'],
			inlineButtonBorder: '#494f66',
			inlineButtonForeground: '#94a3b8',
			inlineButtonBackground: colors.slate['700'],
			inlineButtonBackgroundHoverOrFocusOpacity: '.5',
			tooltipSuccessBackground: colors.sky['500'],
			tooltipSuccessForeground: colors.white,
			editorBackground: colors.slate['825'],
			editorActiveTabForeground: colors.sky['300'],
			editorActiveTabBackground: colors.slate['825'],
			editorActiveTabBorderColor: `${colors.slate['500']}4d`,
			editorTabBarBorderBottomColor: `${colors.slate['500']}4d`,
			editorActiveTabIndicatorBottomColor: colors.sky['300'],
			editorActiveTabIndicatorHeight: '1.5px',
			editorTabBarBackground: colors.slate['850'],
			editorTabBorderRadius: '0',
			frameBoxShadowCssValue: '0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a'
		},
		textMarkers: {
			inlineMarkerBorderWidth: '0',
			markBackground: `${colors.sky['300']}26`,
			markBorderColor: colors.sky['400'],
			insBackground: `${colors.teal['400']}26`,
			insDiffIndicatorColor: colors.teal['400'],
			insBorderColor: colors.teal['400'],
			delBackground: `${colors.rose['400']}26`,
			delBorderColor: colors.rose['400'],
			delDiffIndicatorColor: colors.rose['400']
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
	output: 'static',
	adapter: vercel({
		webAnalytics: {
			enabled: true
		}
	})
})
