import plugin from 'tailwindcss/plugin'
import { corePlugins } from 'tailwindcss-priv/src/corePlugins'
import type {
	CSSRuleObject,
	ExtractorFn,
	KeyValuePair,
	PluginAPI,
	ResolvableTo,
	ThemeConfig
} from 'tailwindcss/types/config'
import defaultTheme from 'tailwindcss/defaultTheme'
import mapObject, { mapObjectSkip } from 'map-obj'
import { includeKeys } from 'filter-obj'
import * as log from './util/log'
import getContext, {
	type Context,
	type PluginOptions,
	type ResolvedFluidThemeConfig
} from './util/context'
import { Length, type RawValue } from './util/css'
import * as expr from './util/expr'
import { addVariant, addVariantWithModifier, matchVariant } from './util/tailwind'
import { tuple } from './util/set'
import { FluidError, codes } from './util/errors'
import { Comment, Root, Rule } from 'postcss'
import type { Config } from 'tailwindcss'
import {
	IS_FLUID_EXTRACT,
	DEFAULT_PREFIX,
	DEFAULT_SEPARATOR,
	PASSED_PREFIX,
	PASSED_SEPARATOR
} from './extractor'

export type FluidThemeConfig = ResolvableTo<ResolvedFluidThemeConfig>

type MatchUtilOrComp = PluginAPI['matchUtilities'] | PluginAPI['matchComponents']
type FilterFn = (
	utilityOrComponentNames: string[],
	options: Parameters<MatchUtilOrComp>[1]
) => boolean | null | undefined

const makeComment = (e: unknown, raw = true) => {
	if (e instanceof FluidError) {
		return `${raw ? '/* ' : ''}error - ${e.message}${raw ? ' */' : ''}`
	} else throw e
}

/**
 * Return a modified PluginAPI that intercepts calls to matchUtilities and matchComponents
 * to add fluidized versions of each
 */
function getFluidAPI(
	api: PluginAPI,
	context: Context,
	{ filter }: { filter?: FilterFn } = {}
): PluginAPI {
	const addFluid =
		(orig: MatchUtilOrComp): MatchUtilOrComp =>
		(utilities, options) => {
			// Skip ones with types that don't include length or any
			if (options?.type && !options.type.includes('length') && !options.type.includes('any')) return
			// Skip filtered out ones
			if (filter && !filter(Object.keys(utilities), options)) return

			// Add fluid version
			// Start by filtering the values to only valid lengths
			const values = includeKeys(options?.values ?? {}, (_, v) =>
				Boolean(Length.parse(v))
			) as KeyValuePair<string, RawValue>

			// Tailwind doesn't use the DEFAULT convention for modifiers so we'll extract it:
			const { DEFAULT, ...modifiers } = values

			Object.entries(utilities).forEach(([util, origFn]) => {
				orig(
					{
						[`~${context.prefix}${util}`](start, { modifier: end }) {
							// See note about default modifiers above
							if (end === null && DEFAULT) end = DEFAULT

							try {
								const clamp = expr.generate(start, end, context)
								return origFn(clamp, { modifier: null }) // don't pass along the modifier
							} catch (e) {
								return {
									[makeComment(e)]: {}
								}
							}
						}
					},
					{
						...options,
						values,
						modifiers,
						supportsNegativeValues: false, // we add it manually, to override Tailwind's default behavior of only negating the value (not the modifier)
						respectPrefix: false // we add it manually, for better ordering
					}
				)

				// Add negative version if supported
				if (!options?.supportsNegativeValues) return
				orig(
					{
						[`~-${context.prefix}${util}`](start, { modifier: end }) {
							// See note about default modifiers above
							if (end === null && DEFAULT) end = DEFAULT

							try {
								const clamp = expr.generate(start, end, context, { negate: true })
								return origFn(clamp, { modifier: null }) // don't pass along the modifier
							} catch (e) {
								return {
									[makeComment(e)]: {}
								}
							}
						}
					},
					{
						...options,
						values,
						modifiers,
						supportsNegativeValues: false,
						respectPrefix: false
					}
				)
			})
		}

	const noop = () => {}
	return {
		...api,
		addUtilities: noop,
		addComponents: noop,
		addVariant: noop,
		addBase: noop,
		matchVariant: noop,
		// @ts-expect-error undocumented API used in corePlugins
		addDefaults: noop,
		matchUtilities: addFluid(api.matchUtilities),
		matchComponents: addFluid(api.matchComponents)
	}
}

const IS_FLUID_PLUGIN = Symbol()
const fluidPlugin = (options: PluginOptions = {}, api: PluginAPI) => {
	const { config, theme, corePlugins: corePluginEnabled, matchUtilities } = api
	const context = getContext(config, theme, options)
	const { screens, containers, prefix, separator } = context

	// Make sure they remembered to pass in extractor correctly
	// Don't error, b/c i.e. prettier-plugin-tailwindcss and Tailwind Play
	// override `config.content` anyway
	const extractor = config('content.extract.DEFAULT') as ExtractorFn
	if (!extractor || !(IS_FLUID_EXTRACT in extractor)) {
		log.warn('fluid-tailwind', codes['extractor-missing']())
	} else if (
		prefix !== DEFAULT_PREFIX &&
		(!(PASSED_PREFIX in extractor) || extractor[PASSED_PREFIX] !== prefix)
	) {
		log.warn('fluid-tailwind', codes['extractor-option-mismatch']('prefix', prefix))
	} else if (
		separator !== DEFAULT_SEPARATOR &&
		(!(PASSED_SEPARATOR in extractor) || extractor[PASSED_SEPARATOR] !== separator)
	) {
		log.warn('fluid-tailwind', codes['extractor-option-mismatch']('separator', separator))
	}

	// Add new fluid text utility to handle potentially complex theme values
	// ---
	// This has to be first so that utilities like ~leading (from corePlugins) can override it

	type Values<Type> = Type extends KeyValuePair<any, infer Item> ? Item : never
	type FontSize = Values<ThemeConfig['fontSize']>

	// The only thing we can really filter out is if the font size itself
	// isn't a parseable length
	const fontSizeValues = mapObject(
		(theme('fontSize') ?? {}) as KeyValuePair<string, FontSize>,
		(k, v) => {
			const [fontSize] = Array.isArray(v) ? v : [v]
			return Length.parse(fontSize) ? [k, v] : mapObjectSkip
		}
	)

	type NormalizedFontSize = {
		fontSize?: string
		lineHeight?: string
		fontWeight?: string | number
		letterSpacing?: string
	}
	const normalize = (fontSize: FontSize | null): NormalizedFontSize => {
		if (typeof fontSize === 'string') return { fontSize }
		else if (Array.isArray(fontSize))
			return typeof fontSize[1] === 'string'
				? {
						fontSize: fontSize[0],
						lineHeight: fontSize[1]
					}
				: {
						fontSize: fontSize[0],
						...fontSize[1]
					}
		return {}
	}

	// See note about default modifiers in `getFluidAPI`
	const { DEFAULT, ...fontSizeModifiers } = fontSizeValues
	matchUtilities(
		{
			[`~${prefix}text`](_from, { modifier: _to }) {
				if (_to === null && DEFAULT) _to = DEFAULT

				const from = normalize(_from)
				const to = normalize(_to)

				const rules: CSSRuleObject = {}

				// Font size
				try {
					rules['font-size'] = expr.generate(from.fontSize, to.fontSize, context, {
						type: true
					})
				} catch (e) {
					rules['font-size'] = makeComment(e)
				}

				// Line height. Make sure to use double equals to catch nulls and strings <-> numbers
				if (from.lineHeight == to.lineHeight) {
					rules['line-height'] = from.lineHeight ?? null
				} else {
					try {
						rules['line-height'] = expr.generate(from.lineHeight, to.lineHeight, context)
					} catch (e) {
						rules['line-height'] = makeComment(e)
					}
				}

				// Letter spacing. Make sure to use double equals to catch nulls and strings <-> numbers
				if (from.letterSpacing == to.letterSpacing) {
					rules['letter-spacing'] = from.letterSpacing ?? null
				} else {
					try {
						rules['letter-spacing'] = expr.generate(from.letterSpacing, to.letterSpacing, context)
					} catch (e) {
						rules['letter-spacing'] = makeComment(e)
					}
				}

				// Font weight. Make sure to use double equals to catch nulls and strings <-> numbers
				if (from.fontWeight == to.fontWeight) {
					rules['font-weight'] = from.fontWeight ? from.fontWeight + '' : null
				} else {
					rules['font-weight'] = makeComment(FluidError.fromCode('mismatched-font-weights'))
				}

				return rules
			}
		},
		{
			values: fontSizeValues,
			modifiers: fontSizeModifiers,
			supportsNegativeValues: false,
			respectPrefix: false,
			type: ['absolute-size', 'relative-size', 'length', 'percentage']
		}
	)

	// Add fluid versions for enabled core plugins
	// ---

	const fluidCoreAPI = getFluidAPI(api, context, {
		// Filter out fontSize plugin
		filter: (utils, options) => !utils.includes('text') || !options?.type?.includes('length')
	})
	Object.entries(corePlugins).forEach(([name, corePlugin]) => {
		if (name === 'preflight' || !corePluginEnabled(name)) return
		corePlugin(fluidCoreAPI)
	})

	// Add fluid versions of other plugins
	// ---

	const fluidPluginAPI = getFluidAPI(api, context)
	const plugins = config('plugins') as Config['plugins']
	plugins?.forEach((plug, i) => {
		if (!plug) return
		const handler =
			typeof plug === 'function'
				? '__isOptionsFunction' in plug && plug.__isOptionsFunction
					? plug(undefined).handler
					: plug
				: plug.handler
		if (!(IS_FLUID_PLUGIN in handler)) handler(fluidPluginAPI)
	})

	// Screen variants
	// ---

	// Handle the rewrites and potential errors:
	const rewrite = (
		container: Root,
		[startBP, endBP]: [Length | RawValue, Length | RawValue],
		atContainer?: string | true
	) => {
		try {
			expr.rewrite(container, context, [startBP, endBP], atContainer)
			return '&'
		} catch (e) {
			const comment = new Comment({ text: makeComment(e, false) })

			// Override first rule so there's no duplicates, and b/c it has the right class:
			let firstRule: Rule | undefined
			container.walkRules((rule) => {
				firstRule = rule
				return false
			})
			container.removeAll()
			if (firstRule) {
				firstRule.removeAll()
				firstRule.append(comment)
				container.append(firstRule)
			}
			return '&'
		}
	}

	if (screens?.DEFAULT) {
		log.warn(
			'fluid-tailwind',
			`Your DEFAULT screen breakpoint must be renamed to be used in fluid variants`
		)
	}

	Object.entries(screens).forEach(([s1Key, s1]) => {
		// Add `~screen/screen` variants
		Object.entries(screens).forEach(([s2Key, s2]) => {
			if (s2Key === s1Key) return
			addVariant(api, `~${s1Key}/${s2Key}`, ({ container }) => rewrite(container, [s1, s2]))
		})

		// Add `~screen/[arbitrary]?` variants
		addVariantWithModifier(api, `~${s1Key}`, ({ container, modifier }) =>
			rewrite(container, [s1, modifier])
		)

		// Add `~/screen` variants
		addVariant(api, `~/${s1Key}`, ({ container }) => rewrite(container, [, s1]))
	})

	// Add `~/[arbitrary]?` variant
	addVariantWithModifier(api, '~', ({ modifier, container }) => rewrite(container, [, modifier]))

	// Add `~min-[arbitrary]/(screen|[arbitrary])?` variant
	matchVariant(api, '~min', (value, { modifier, container }) =>
		rewrite(container, [value, modifier])
	)

	// Container variants
	// ---
	if (!containers) return // ensure official container query plugin exists

	if (containers?.DEFAULT) {
		log.warn(
			'fluid-tailwind',
			`Your DEFAULT container breakpoint must be renamed to be used in fluid variants`
		)
	}

	Object.entries(containers).forEach(([c1Key, c1]) => {
		// Add `~@container/container` variants
		Object.entries(containers).forEach(([c2Key, c2]) => {
			if (c2Key === c1Key) return
			addVariant(api, `~@${c1Key}/${c2Key}`, ({ container }) => rewrite(container, [c1, c2], true))
		})

		// Add `~@container/[arbitrary]?` variants
		addVariantWithModifier(api, `~@${c1Key}`, ({ container, modifier }) =>
			rewrite(container, [c1, modifier], true)
		)

		// Add `~@/container` variants
		addVariant(api, `~@/${c1Key}`, ({ container }) => rewrite(container, [, c1], true))
	})

	// Add ~@[arbitrary]|container/[arbitrary]|container variant
	matchVariant(
		api,
		'~@',
		(value, { modifier, container }) =>
			// can't output ${value} without a reverse lookup from theme :/
			rewrite(container, [value, modifier], true),
		{
			values: {
				...containers,
				DEFAULT: null // so they can omit it and use expr.defaultContainers; see log.warn above
			}
		}
	)
}
// Make sure it's named fluid, b/c it shows up in IntelliSense:
const fluid = plugin.withOptions((options: PluginOptions = {}) =>
	// Organized this way to attach the symbol correctly, and also assuage Prettier:
	Object.assign((api: PluginAPI) => fluidPlugin(options, api), { [IS_FLUID_PLUGIN]: true })
)
export default fluid

export { default as extract } from './extractor'

/**
 * Tailwind's default screens converted to `rem`, for better
 * compatibility with core plugins.
 */
export const screens = mapObject(defaultTheme.screens ?? {}, (name, v) => {
	if (typeof v !== 'string') return [name, v]
	const len = Length.parse(v)
	if (!len || len.unit !== 'px') return [name, v]
	return [name, `${len.number / 16}rem`]
})

/**
 * Tailwind's default font sizes, with all line heights converted to `rem` for better
 * compatibility with core plugins.
 */
export const fontSize = mapObject(
	defaultTheme.fontSize ?? {},
	(name, [_size, { lineHeight: _lineHeight }]) => {
		const size = Length.parse(_size)
		const lineHeightLength = Length.parse(_lineHeight)
		if (
			!size ||
			(lineHeightLength && lineHeightLength.number !== 0) ||
			isNaN(parseFloat(_lineHeight))
		)
			return [name, tuple([_size, _lineHeight])]

		return [
			name,
			tuple([_size, new Length(parseFloat(_lineHeight) * size.number, size.unit).cssText])
		]
	}
)
