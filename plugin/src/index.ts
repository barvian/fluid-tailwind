import plugin from 'tailwindcss/plugin'
type Plugin = ReturnType<typeof plugin>
import { corePlugins } from 'tailwindcss-priv/lib/corePlugins'
import { CSSRuleObject, PluginAPI, PluginCreator } from 'tailwindcss/types/config'
import { noop, log, LogLevel, CSSLength, type RawValue, generateExpr, addVariantWithModifier, parseExpr, unique, tuple } from './util'
import defaultTheme from 'tailwindcss/defaultTheme'
import { Container } from 'postcss'
import mapObject, { mapObjectSkip } from 'map-obj'
import { includeKeys } from 'filter-obj'
export { default as fluidExtractor } from './extractor'

type Breakpoints = [string] | [undefined, string] | [string, string]
export type FluidConfig = Partial<{
    defaultScreens: Breakpoints
    defaultContainers: Breakpoints
}>

function parseValue(_val: any, { unit, theme }: Context, level?: LogLevel) {
    if (!_val) return null
    if (typeof _val === 'string') {
        // Test if it's a theme() function
        const [, lookup] = _val.match(/^\s*theme\((.*?)\)\s*$/) ?? []
        if (lookup) _val = theme(lookup)
    }
    const val = CSSLength.parse(_val)
    if (!val) {
        if (level) log[level]('non-lengths', [
            'Fluid utilities can only work with length values'
        ])
        if (level === LogLevel.RISK) throw new Error()
        return null
    }
    if (val.unit !== unit) {
        if (level) log[level]('mismatching-units', [
            `Fluid units must all match`
        ])
        if (level === LogLevel.RISK) throw new Error()
        return null
    }
    return val
}

function parseValues(
    _from: any, _to: any,
    context: Context,
    level?: LogLevel
) {
    if (!_from || !_to) {
        if (level) log[level]('missing-values', [
            'Fluid utilities require two values'
        ])
        if (level === LogLevel.RISK) throw new Error()
        return null
    }
    const from = parseValue(_from, context, level)
    const to = parseValue(_to, context, level)
    if (!from || !to) return null

    if (from.number === to.number) {
        if (level) log[level]('no-change', [
            'Fluid utilities require two distinct values'
        ])
        if (level === LogLevel.RISK) throw new Error()
        return null
    }
    return [from, to] as const
}

type MatchUtilOrComp = PluginAPI['matchUtilities'] | PluginAPI['matchComponents']
type FilterFn = (utilityOrComponentNames: string[], options: Parameters<MatchUtilOrComp>[1]) => boolean | null | undefined

/**
 * Return a modified PluginAPI that intercepts calls to matchUtilities and matchComponents
 * to add fluidized versions of each
 */
function getFluidAPI(api: PluginAPI, {
    addOriginal = true,
    filter
}: Partial<{ addOriginal: boolean, filter: FilterFn }> = {}, context: Context): PluginAPI {
    const addFluid = (orig: MatchUtilOrComp): MatchUtilOrComp => (utilities, options) => {
        // Add original
        if (addOriginal) orig(utilities, options)
        // Skip ones with types that don't include length or any
        if (options?.type && !options.type.includes('length') && !options.type.includes('any')) return
        // Skip filtered out ones
        if (filter && !filter(Object.keys(utilities), options)) return
        
        // Add fluid version
        // Start by filtering the values to only valid lengths
        const values = includeKeys(options?.values ?? {}, (_, v) => Boolean(parseValue(v, context)))

        // TW doesn't use the DEFAULT convention for modifiers so we'll extract it:
        const { DEFAULT, ...modifiers } = values
        
        Object.entries(utilities).forEach(([util, origFn]) => {
            orig({
                [`~${util}`](_from, { modifier: _to }) {
                    // See note about default modifiers above
                    if (_to === null && DEFAULT) _to = DEFAULT

                    const parsed = parseValues(
                        _from,
                        _to,
                        context,
                        LogLevel.WARN
                    )
                    if (!parsed) return null
                    const [from, to] = parsed
                    
                    return origFn(
                        generateExpr(from, context.defaultFromScreen, to, context.defaultToScreen),
                        { modifier: null } // don't pass along the modifier
                    )
                }
            }, {
                ...options,
                values,
                supportsNegativeValues: false, // b/c TW only negates the value, not the modifier
                modifiers
            })
        })
    }
    
    return {
        ...api,
        ...(addOriginal ? {} : {
            addUtilities: noop,
            addComponents: noop,
            addVariant: noop,
            addBase: noop,
            matchVariant: noop,
            addDefaults: noop // private API used in corePlugins
        }),
        matchUtilities: addFluid(api.matchUtilities),
        matchComponents: addFluid(api.matchComponents)
    }
}

class NoChangeBPError extends Error {}
class BreakpointNotFoundError extends Error {}
function rewriteExprs(container: Container, context: Context, [_fromBP, _toBP]: [CSSLength | RawValue, CSSLength | RawValue], atContainer?: string | true) {
    try {
        const fromBP = (typeof _fromBP === 'string')
            // It's arbitrary, so parse it
            ? parseValue(_fromBP, context, LogLevel.RISK)
            : _fromBP
        
        const toBP = (() => {
            if (typeof _toBP !== 'string') return _toBP
            // Check if it's [arbitrary] (i.e. from a modifier)
            if (/^\[(.*?)\]$/.test(_toBP)) {
                return parseValue(_toBP.match(/^\[(.*?)\]$/)?.[1], context, LogLevel.RISK)
            } else {
                const bp = context[atContainer ? 'containers' : 'screens']?.[_toBP]
                if (!bp) throw new BreakpointNotFoundError() // fail if we couldn't find in theme
                return bp
            }
        })()
        
        const defaultFromBP = atContainer ? context.defaultFromContainer! : context.defaultFromScreen
        const defaultToBP = atContainer ? context.defaultToContainer! : context.defaultToScreen
            
        // Walk through each `property: value` and rewrite any fluid expressions
        let foundExpr = false
        container.walkDecls((decl) => {
            const parsed = parseExpr(decl.value)
            if (!parsed) return
            foundExpr = true
            const resolvedFromBP = fromBP ?? defaultFromBP
            const resolvedToBP = toBP ?? defaultToBP
            if (resolvedFromBP.number === resolvedToBP.number) {
                throw new NoChangeBPError()
            }

            decl.value = generateExpr(parsed.from, resolvedFromBP, parsed.to, resolvedToBP, { atContainer, checkSC144: parsed.checkSC144 })
        })
        // Prevent rules like ~md/lg:relative
        if (!foundExpr) {
            log.warn('no-utility', [
                'Fluid variants can only be used with fluid utilities'
            ])
            return [] as const
        }
    } catch (e) {
        if (e instanceof NoChangeBPError) {
            log.warn('no-change', [
                'Fluid utilities require two distinct values'
            ])
        }
        return [] as const
    }
    return '&'
}

function getContext(theme: PluginAPI['theme']) {
    const fluid: FluidConfig = theme('fluid') ?? {}

    function getBreakpoints(container = false) {
        const bpsKey = container ? 'containers' : 'screens'
        const rawBps = theme(bpsKey)
        if (container && !rawBps) return [] as const

        // Get all "simple" breakpoints (i.e. just a length, not an object)
        const bps = mapObject(rawBps!, (k, v) => {
            const len = CSSLength.parse(v)
            if (!len) return mapObjectSkip
            return [k as string, len]
         })
        const defaultsKey = container ? 'defaultContainers' : 'defaultScreens'
        
        let sortedBreakpoints: CSSLength[]
        function resolveDefaultBreakpoint(bpType: 'from' | 'to', rawBp: string | undefined) {    
            if (typeof rawBp === 'string') {
                const parsed = CSSLength.parse(rawBp)
                if (!parsed) throw new Error(`Invalid value for \`theme.fluid.${defaultsKey}[${bpType === 'from' ? 0 : 1}]\``)
                return parsed
            } else if (rawBp != null) {
                throw new Error(`Invalid value for \`theme.fluid.${defaultsKey}[${bpType === 'from' ? 0 : 1}]\``)
            }
            
            sortedBreakpoints ??= (() => {
                const bpsVals = Object.values(bps)
                if (!bpsVals.length) {
                    throw new Error(`Cannot resolve \`theme.fluid.${defaultsKey}[${bpType === 'from' ? 0 : 1}]\` because there's no simple values in \`theme.${bpsKey}\``)
                }
                // Error if they have different units (can't sort that way)
                if (unique(bpsVals.map(l => l.unit!)) > 1) {
                    throw new Error(`Cannot resolve \`theme.fluid.${defaultsKey}[${bpType === 'from' ? 0 : 1}]\` because \`theme.${bpsKey}\` contains values of different units`)
                }

                return bpsVals.sort((a, b) => a.number - b.number)
            })()
            return sortedBreakpoints[bpType === 'from' ? 0 : sortedBreakpoints.length-1]
        }

        const [defaultFrom, defaultTo] = fluid[defaultsKey] ?? []
        return [bps, resolveDefaultBreakpoint('from', defaultFrom), resolveDefaultBreakpoint('to', defaultTo)] as const
    }

    const [screens, defaultFromScreen, defaultToScreen] = getBreakpoints()
    const [containers, defaultFromContainer, defaultToContainer] = getBreakpoints(true)
    if (unique([defaultFromScreen!.unit, defaultToScreen!.unit]) !== 1 || defaultFromScreen!.unit == null) {
        throw new Error(`All default fluid breakpoints must have the same units`)
    }
    return {
        theme,
        screens: screens!, defaultFromScreen: defaultFromScreen!, defaultToScreen: defaultToScreen!,
        containers, defaultFromContainer, defaultToContainer,
        unit: defaultFromScreen!.unit
    }
}
type Context = ReturnType<typeof getContext>

export const fluidCorePlugins = plugin((api: PluginAPI) => {
    const { theme, corePlugins: corePluginEnabled, addVariant, matchVariant, matchUtilities } = api
    const context = getContext(theme)
    const { screens, containers } = context

    // Add fluid versions for enabled core plugins
    const fluidAPI = getFluidAPI(api, {
        addOriginal: false,
        // Filter out fontSize plugin
        filter: (utils, options) => !utils.includes('text') || !options?.type?.includes('length')
    }, context)
    Object.entries(corePlugins).forEach(([name, _p]) => {
        if (!corePluginEnabled(name)) return
        const p = _p as PluginCreator
        p(fluidAPI)
    })

    // Add new fluid text utility to handle potentially complex theme values
    // ---

    // The only thing we can really filter out is if the font size itself
    // is in a different unit than the breakpoints
    const fontSizeValues = mapObject(theme('fontSize') ?? {}, (k, v) => {
        const [fontSize] = Array.isArray(v) ? v : [v]
        return parseValue(fontSize, context) ? [k as string, v] : mapObjectSkip
    })
        
    // See note about default modifiers in `getFluidAPI`
    const { DEFAULT, ...fontSizeModifiers } = fontSizeValues
    matchUtilities({
        '~text'(from, { modifier: to }) {
            if (to === null && DEFAULT) to = DEFAULT

            // Normalize inputs
            if (!Array.isArray(from)) from = [from]
            else if (/^(string|number)$/.test(typeof from[1])) from[1] = { lineHeight: from[1] }
            if (!Array.isArray(to)) to = [to]
            else if (/^(string|number)$/.test(typeof to[1])) to[1] = { lineHeight: to[1] }

            const rules: CSSRuleObject = {}

            // Font size
            const parsedFontSizes = parseValues(from[0], to[0], context, LogLevel.WARN)
            if (!parsedFontSizes) return null
            rules['font-size'] = generateExpr(parsedFontSizes[0], context.defaultFromScreen, parsedFontSizes[1], context.defaultToScreen, { checkSC144: true })

            // Line height. Make sure to use double equals to catch nulls and strings <-> numbers
            if (from[1]?.lineHeight == to[1]?.lineHeight) {
                rules['line-height'] = from[1]?.lineHeight
            } else {
                const parsedLineHeights = parseValues(from[1]?.lineHeight, to[1]?.lineHeight, context, LogLevel.WARN)
                if (!parsedLineHeights) return null
                rules['line-height'] = generateExpr(parsedLineHeights[0], context.defaultFromScreen, parsedLineHeights[1], context.defaultToScreen)
            }

            // Letter spacing. Make sure to use double equals to catch nulls and strings <-> numbers
            if (from[1]?.letterSpacing == to[1]?.letterSpacing) {
                rules['letter-spacing'] = from[1]?.letterSpacing
            } else {
                const parsedLetterSpacing = parseValues(from[1]?.letterSpacing, to[1]?.letterSpacing, context, LogLevel.WARN)
                if (!parsedLetterSpacing) return null
                rules['letter-spacing'] = generateExpr(parsedLetterSpacing[0], context.defaultFromScreen, parsedLetterSpacing[1], context.defaultToScreen)
            }

            // Font weight. Make sure to use double equals to catch nulls and strings <-> numbers
            // Also, conveniently: NaN !== NaN
            if (from[1]?.fontWeight == to[1]?.fontWeight) {
                rules['font-weight'] = from[1]?.fontWeight
            } else {
                return null
            }

            return rules
        }
    }, {
        values: fontSizeValues,
        modifiers: fontSizeModifiers,
        supportsNegativeValues: false,
        type: ['absolute-size', 'relative-size', 'length', 'percentage']
    })

    // Screen variants
    // ---

    if (screens?.DEFAULT) {
        log.warn('inaccessible-breakpoint', [
            `Your DEFAULT screen breakpoint must be renamed to be used in fluid variants`
        ])
    }

    Object.entries(screens).forEach(([s1Key, s1]) => {
        // Add `~screen/screen` variants
        Object.entries(screens).forEach(([s2Key, s2]) => {
            if (s2Key === s1Key) return
            // @ts-expect-error undocumented API
            addVariant(`~${s1Key}/${s2Key}`, ({ container }: { container: Container }) =>
                rewriteExprs(container, context, [s1, s2])
            )
        })

        // Add `~screen/[arbitrary]?` variants
        addVariantWithModifier(api, `~${s1Key}`, ({ container, modifier }) =>
            rewriteExprs(container, context, [s1, modifier])
        )

        // Add `~/screen` variants
        // @ts-expect-error undocumented API
        addVariant(`~/${s1Key}`, ({ container }) => 
            rewriteExprs(container, context, [, s1])
        )
    })

    // Add `~/[arbitrary]` variant
    addVariantWithModifier(api, '~', ({ modifier, container }) =>
        rewriteExprs(container, context, [, modifier])
    )

    // Add `~min-[arbitrary]/screen|[arbitrary]` variant
    // @ts-expect-error undocumented API
    matchVariant('~min', (value, { modifier, container }: { modifier: string | null, container: Container }) => 
        rewriteExprs(container, context, [value, modifier])
    )

    // Container variants
    // ---
    if (!containers) return // ensure official container query plugin exists

    if (containers?.DEFAULT) {
        log.warn('inaccessible-breakpoint', [
            `Your DEFAULT container breakpoint must be renamed to be used in fluid variants`
        ])
    }

    Object.entries(containers).forEach(([c1Key, c1]) => {
        // Add `~@container/container` variants
        Object.entries(containers).forEach(([c2Key, c2]) => {
            if (c2Key === c1Key) return
            // @ts-expect-error undocumented API
            addVariant(`~@${c1Key}/${c2Key}`, ({ container }: { container: Container }) =>
                rewriteExprs(container, context, [c1, c2], true)
            )
        })

        // Add `~@container/[arbitrary]?` variants
        addVariantWithModifier(api, `~@${c1Key}`, ({ container, modifier }) =>
            rewriteExprs(container, context, [c1, modifier], true)
        )

        // Add `~@/container` variants
        // @ts-expect-error undocumented API
        addVariant(`~@/${c1Key}`, ({ container }) => 
            rewriteExprs(container, context, [, c1], true)
        )
    })

    // Add ~@[arbitrary]|container/[arbitrary]|container variant
    // @ts-expect-error undocumented API
    matchVariant('~@', (value, { modifier, container }: { modifier: string | null, container: Container }) => (
        rewriteExprs(container, context, [value, modifier], true)
    ), {
        values: {
            ...containers,
            DEFAULT: null // so they can omit it and use fluid.defaultContainers; see log.warn above
        }
    })
})

/**
 * Create fluid versions for a plugin's utilities.
 */
export const fluidize = (
    { handler, config }: Plugin,
    filter?: FilterFn
): Plugin => ({
    handler: (api) => handler(getFluidAPI(api, { filter }, getContext(api.theme))),
    config
})

/**
 * Re-export all the default simple screens in rems, for better
 * compatibility with default utilities
 */
export const defaultThemeScreensInRems = mapObject(defaultTheme.screens ?? {}, (name, v) => {
    if (typeof v !== 'string') return [name, v]
    const len = CSSLength.parse(v)
    if (!len || len.unit !== 'px') return [name, v]
    return [name, `${len.number / 16}rem`]
})

/**
 * Re-export all the default simple screens in rems, for better
 * compatibility with default utilities
 */
export const defaultThemeFontSizeInRems = mapObject(defaultTheme.fontSize ?? {}, (name, [_size, { lineHeight: _lineHeight }]) => {
    const size = CSSLength.parse(_size)
    const lineHeightLength = CSSLength.parse(_lineHeight)
    if (!size || (lineHeightLength && lineHeightLength.number !== 0) || isNaN(parseFloat(_lineHeight))) return [name, tuple([_size, _lineHeight])]
    return [name, tuple([_size, new CSSLength(parseFloat(_lineHeight) * size.number, size.unit).cssText])]
})
