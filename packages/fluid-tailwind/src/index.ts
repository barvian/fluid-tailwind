import plugin from 'tailwindcss/plugin'
import corePlugins from './corePlugins'
import type { PluginAPI } from 'tailwindcss/plugin'
import defaultTheme from 'tailwindcss/defaultTheme'
import { includeKeys } from 'filter-obj'
import * as log from './util/log'
import getContext, {
	type Context,
	type PluginOptions,
	type ResolvedFluidThemeConfig
} from './util/context'
import { Length, type RawValue } from './util/css'
import type { Config } from 'tailwindcss'

export type FluidThemeConfig = ResolvableTo<ResolvedFluidThemeConfig>

type MatchUtilOrComp = PluginAPI['matchUtilities'] | PluginAPI['matchComponents']
type FilterFn = (
	utilityOrComponentNames: string[],
	options: Parameters<MatchUtilOrComp>[1]
) => boolean | null | undefined

const noop = () => {}

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
			const values = includeKeys(options?.values ?? {}, (_, v) => true
				// Boolean(Length.parse(v))
			) as KeyValuePair<string, RawValue>

			// Tailwind doesn't use the DEFAULT convention for modifiers so we'll extract it:
			const { DEFAULT, ...modifiers } = values

			Object.entries(utilities).forEach(([util, origFn]) => {
				orig(
					{
						[`${util}-${context.className}`](start, { modifier: end }) {
							// See note about default modifiers above
							if (end === null && DEFAULT) end = DEFAULT
							
							return {
								[`@apply ${util}-[clamp(0,0.5vh,1)]`]: {}
							}
						}
					},
					{
						...options,
						values,
						modifiers
					}
				)
			})
		}

	return {
		...api,
		addUtilities: noop,
		addComponents: noop,
		addVariant: noop,
		addBase: noop,
		matchVariant: noop,
		// @ts-expect-error undocumented API used in v3 core plugins
		addDefaults: noop,
		matchUtilities: addFluid(api.matchUtilities),
		matchComponents: addFluid(api.matchComponents)
	}
}

const IS_FLUID_PLUGIN = Symbol()
const fluidPlugin = (options: PluginOptions = {}, api: PluginAPI) => {
	const { config, theme, matchUtilities } = api
	const context = getContext(config, theme, options)
	const { screens, containers, className } = context

	// Add new fluid text utility to handle potentially complex theme values
	// ---
	// This has to be first so that utilities like leading (from core) can override it

	type Values<Type> = Type extends KeyValuePair<any, infer Item> ? Item : never
	type FontSize = Values<ThemeConfig['fontSize']>

	const fontSizeValues = (theme('fontSize') ?? {}) as KeyValuePair<string, FontSize>

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
			[`text-${className}`](_from, { modifier: _to }) {
				if (_to === null && DEFAULT) _to = DEFAULT

				const from = normalize(_from)
				const to = normalize(_to)

				return {
					'font-size': 'clamp',
					'line-height': 'clamp',
					'letter-spacing': 'clamp',
					'font-weight': '400'
				}
			}
		},
		{
			values: fontSizeValues,
			modifiers: fontSizeModifiers,
			supportsNegativeValues: false,
			type: ['absolute-size', 'relative-size', 'length', 'percentage']
		}
	)

	// Add fluid versions for enabled core plugins
	// ---

	const fluidCoreAPI = getFluidAPI(api, context, {
		// Filter out fontSize plugin
		filter: (utils, options) => !utils.includes('text') || !options?.type?.includes('length')
	})
	corePlugins(fluidCoreAPI)

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

	// fl utility
	// ---

	
}
// Make sure it's named fluid, b/c it shows up in IntelliSense:
const fluid = plugin.withOptions<PluginOptions>((options) => 
	Object.assign((api: PluginAPI) => fluidPlugin(options, api), { [IS_FLUID_PLUGIN]: true })
)
export default fluid
