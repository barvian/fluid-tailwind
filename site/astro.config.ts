import { defineConfig, squooshImageService } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import expressiveCode, { ExpressiveCodeTheme } from 'astro-expressive-code'
import { readFileSync } from 'node:fs'
import sectionize from 'remark-sectionize'
import vercel from '@astrojs/vercel/static'
import intersectingDirective from './directives/intersecting/register'
import { parseToRgba, rgba } from 'color2k'
import config from './tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'
const {
	theme: { colors, fontFamily, fontSize, boxShadow, borderRadius, spacing }
} = resolveConfig(config)

const adjustAlpha = (color: string, a: number) => {
	const [r, g, b] = parseToRgba(color)
	return rgba(r, g, b, a)
}

/** @type {import('astro-expressive-code').AstroExpressiveCodeOptions} */
const codeOptions = {
	theme: ExpressiveCodeTheme.fromJSONString(readFileSync('./vstheme.json', 'utf8')),
	styleOverrides: {
		uiFontSize: fontSize.xs[0],
		uiFontFamily: fontFamily.sans.join(', '),
		codeFontFamily: fontFamily.mono.join(', '),
		codeFontSize: fontSize.sm[0],
		codePaddingBlock: spacing['5'],
		uiPaddingBlock: spacing['2'],
		borderRadius: borderRadius.xl,
		borderWidth: '1px',
		frames: {
			terminalBackground: colors.slate['825'],
			terminalTitlebarDotsForeground: colors.slate['600'],
			terminalTitlebarDotsOpacity: '1',
			terminalTitlebarBorderBottomColor: adjustAlpha(colors.slate['500'], 0.3),
			terminalTitlebarBackground: colors.slate['825'],
			inlineButtonBorder: colors.slate['600'],
			inlineButtonForeground: colors.slate['400'],
			inlineButtonBackground: colors.slate['700'],
			inlineButtonBackgroundHoverOrFocusOpacity: '.5',
			tooltipSuccessBackground: colors.sky['500'],
			tooltipSuccessForeground: colors.white,
			editorBackground: colors.slate['825'],
			editorActiveTabForeground: colors.sky['300'],
			editorActiveTabBackground: colors.slate['825'],
			editorActiveTabBorderColor: adjustAlpha(colors.slate['500'], 0.3),
			editorTabBarBorderBottomColor: adjustAlpha(colors.slate['500'], 0.3),
			editorActiveTabIndicatorBottomColor: colors.sky['300'],
			editorActiveTabIndicatorHeight: '1.5px',
			editorTabBarBackground: colors.slate['850'],
			editorTabBorderRadius: '0',
			frameBoxShadowCssValue: boxShadow.md
		},
		textMarkers: {
			inlineMarkerBorderWidth: '0',
			markBackground: adjustAlpha(colors.sky['300'], 0.15),
			markBorderColor: colors.sky['400'],
			insBackground: adjustAlpha(colors.teal['400'], 0.15),
			insDiffIndicatorColor: colors.teal['400'],
			insBorderColor: colors.teal['400'],
			delBackground: adjustAlpha(colors.rose['400'], 0.15),
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
