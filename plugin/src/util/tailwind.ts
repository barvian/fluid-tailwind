import type { Root } from 'postcss'
import type { KeyValuePair, PluginAPI } from 'tailwindcss/types/config'

export const addVariant = (
	api: PluginAPI,
	variant: string,
	definition: string | string[] | ((extra: { container: Root }) => string | string[])
) =>
	api.addVariant(
		variant,
		// @ts-expect-error undocumented API
		definition
	)

export const matchVariant = <T = string>(
	api: PluginAPI,
	name: string,
	cb: (value: T | string, extra: { modifier: string | null; container: Root }) => string | string[],
	options?: {
		values?: KeyValuePair<string, T>
		sort?(
			a: { value: T | string; modifier: string | null },
			b: { value: T | string; modifier: string | null }
		): number
	}
) =>
	api.matchVariant(
		name,
		// @ts-expect-error undocumented API
		cb,
		options
	)

export const addVariantWithModifier = (
	api: PluginAPI,
	variant: string,
	fn: (extra: { container: Root; modifier: string | null }) => string | string[]
) =>
	api.matchVariant(
		variant,
		// @ts-expect-error undocumented API
		(_, { modifier, container }) => fn({ modifier, container }),
		{
			values: { DEFAULT: null }
		}
	)
