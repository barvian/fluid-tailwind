import type { KeyValuePair, PluginAPI, ThemeConfig } from 'tailwindcss/types/config'
import mapObject, { mapObjectSkip } from 'map-obj'
import { error } from './errors'
import { Length } from './css'
import { unique } from './set'

export type PluginOptions = {
	checkSC144?: boolean
}

type Breakpoints = [string] | [undefined, string] | [string, string]
export type ResolvedFluidThemeConfig = Partial<{
	defaultScreens: Breakpoints
	defaultContainers: Breakpoints
}>

export default function getContext(
	theme: PluginAPI['theme'],
	{ checkSC144 = true }: PluginOptions = {}
) {
	const themeConfig: ResolvedFluidThemeConfig = theme('fluid') ?? {}

	// Filter breakpoints by simple valid lengths
	const filterBreakpoints = (key: 'screens' | 'containers') => {
		const rawBps = theme(key) as ThemeConfig['screens'] // NOTE: containers config is currently untyped
		if (Array.isArray(rawBps) || typeof rawBps !== 'object') return {}

		return mapObject(rawBps, (k, v) => {
			const len = Length.parse(v)
			if (!len) return mapObjectSkip
			return [k, len]
		})
	}

	const sortBreakpoints = (bps: KeyValuePair<string, Length>, key: 'screens' | 'containers') => {
		const bpsVals = Object.values(bps)
		// Error if they have different units (can't sort that way)
		if (unique(bpsVals.map((l) => l.unit!)) > 1) error('sort-mismatched-bp-units', key)

		return bpsVals.sort((a, b) => a.number - b.number)
	}

	// Feels like there should be a cleaner way to lazily compute things:
	let _screens: ReturnType<typeof filterBreakpoints>
	let _sortedScreens: ReturnType<typeof sortBreakpoints>
	let _defaultStartScreen: string | Length | undefined
	let _defaultEndScreen: string | Length | undefined
	let _containers: ReturnType<typeof filterBreakpoints>
	let _sortedContainers: ReturnType<typeof sortBreakpoints>
	let _defaultStartContainer: string | Length | undefined
	let _defaultEndContainer: string | Length | undefined
	return {
		get screens() {
			return _screens ?? (_screens = filterBreakpoints('screens'))
		},
		get sortedScreens() {
			return _sortedScreens ?? (_sortedScreens = sortBreakpoints(this.screens, 'screens'))
		},
		get defaultStartScreen() {
			return (
				_defaultStartScreen ??
				(_defaultStartScreen = themeConfig.defaultScreens?.[0] ?? this.sortedScreens[0])
			)
		},
		get defaultEndScreen() {
			return (
				_defaultEndScreen ??
				(_defaultEndScreen =
					themeConfig.defaultScreens?.[1] ?? this.sortedScreens[this.sortedScreens.length - 1])
			)
		},
		get containers() {
			return _containers ?? (_containers = filterBreakpoints('containers'))
		},
		get sortedContainers() {
			return (
				_sortedContainers ?? (_sortedContainers = sortBreakpoints(this.containers, 'containers'))
			)
		},
		get defaultStartContainer() {
			return (
				_defaultStartContainer ??
				(_defaultStartContainer = themeConfig.defaultContainers?.[0] ?? this.sortedContainers[0])
			)
		},
		get defaultEndContainer() {
			return (
				_defaultEndContainer ??
				(_defaultEndContainer =
					themeConfig.defaultContainers?.[1] ??
					this.sortedContainers[this.sortedContainers.length - 1])
			)
		},
		theme,
		checkSC144
	}
}
export type Context = ReturnType<typeof getContext>
