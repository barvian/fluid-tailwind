import { Container } from 'postcss'
import { KeyValuePair, PluginAPI } from 'tailwindcss/types/config'
export { default as log } from 'tailwindcss-priv/lib/util/log'
export enum LogLevel {
	WARN = 'warn',
	RISK = 'risk'
}

// No-op for better type inference of tuples, without `as const` making things readonly
// see https://stackoverflow.com/a/64294629
export const tuple = <T extends [any, ...any]>(v: T) => v

export const noop = () => {}

export type RawValue = string | null | undefined

// Please refer to MDN when updating this list:
// https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
// Only need to check for ones that could also be valid media/container queries (i.e. no vw, cqw)
const lengthUnits = ['cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px', 'em', 'ex', 'ch', 'rem', 'lh', 'rlh']
// Ripped from Tailwind:
// https://github.com/tailwindlabs/tailwindcss/blob/master/src/util/dataTypes.js
const lengthRegExp = new RegExp(
	`^\s*([+-]?[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?)(${lengthUnits.join('|')})\s*$`
)
export class CSSLength {
	constructor(
		public number: number,
		public unit?: string
	) {}
	get cssText() {
		return `${this.number}${this.unit ?? ''}`
	}
	static parse(raw: unknown) {
		if (raw === 0) return new this(0)
		if (typeof raw !== 'string') return null
		if (parseFloat(raw) === 0) return new this(0)

		const match = raw.match(lengthRegExp)
		const number = parseFloat(match?.[1] ?? '')
		return isNaN(number) ? null : new this(number, match?.[2])
	}
}

let formatters: Record<number, Intl.NumberFormat> = {}
export const toPrecision = (num: number, precision: number) =>
	(formatters[precision] ??= new Intl.NumberFormat('en-US', {
		maximumFractionDigits: precision,
		useGrouping: false
	})).format(num)

// Count decimal places in number
export const precision = (num: number) => {
	if (Math.floor(num.valueOf()) === num.valueOf()) return 0
	return num.toString().split('.')[1].length || 0
}

export const clamp = (min: number, n: number, max: number) => Math.min(Math.max(n, min), max)

export const unique = (iter: Iterable<any>) => new Set(iter).size

export function generateExpr(
	from: CSSLength,
	fromBP: CSSLength,
	to: CSSLength,
	toBP: CSSLength,
	{ atContainer, checkSC144 = false }: { atContainer?: string | true; checkSC144?: boolean } = {}
) {
	const unit = from.unit // you can technically get it from any of the values
	const p = Math.max(
		precision(from.number),
		precision(fromBP.number),
		precision(to.number),
		precision(toBP.number),
		2
	)

	const min = `${Math.min(from.number, to.number)}${unit}` // CSS requires the min < max in a clamp
	const max = `${Math.max(from.number, to.number)}${unit}` // CSS requires the min < max in a clamp
	const slope = (to.number - from.number) / (toBP.number - fromBP.number)
	const intercept = from.number - fromBP.number * slope

	// SC 1.4.4 check
	let failingBP = null
	if (checkSC144) {
		const zoom1 = (vw: number) => clamp(from.number, intercept + slope * vw, to.number) // 2*zoom1(vw) is the AA requirement
		const zoom5 = (vw: number) => clamp(5 * from.number, 5 * intercept + slope * vw, 5 * to.number) // browser doesn't scale vw units when zooming, so this isn't 5*zoom1(vw)

		// Check the clamped points on the lines 2*z1(vw) and zoom5(vw) and fail if zoom5 < 2*zoom1
		if (5 * from.number < 2 * zoom1(5 * fromBP.number))
			failingBP = new CSSLength(fromBP.number * 5, fromBP.unit) // fails at 5*fromBP
		else if (zoom5(toBP.number) < 2 * to.number) failingBP = toBP
	}
	const comment = `/* ${failingBP ? 'not ' : ''}fluid from ${from.cssText} at ${fromBP.cssText} to ${to.cssText} at ${toBP.cssText}${atContainer ? ' (container)' : ''}${checkSC144 ? '; ' + (failingBP ? 'fails WCAG SC 1.4.4 at i.e. ' + failingBP.cssText : 'passes WCAG SC 1.4.4') : ''} */`
	// Return the from value if it fails SC 1.4.4, so that it could be potentially corrected with a fluid variant
	if (failingBP) return `${from.cssText}${comment}` // only output the from value to not create an AA violation
	// Return the from value if the fromBP = toBP. We can't throw because they could change the breakpoints later with a variant
	if (fromBP.number === toBP.number) return `${from.cssText}${comment}`

	return `clamp(${min},${toPrecision(intercept, p)}${unit} + ${toPrecision(slope * 100, p)}${atContainer ? 'cqw' : 'vw'},${max})${comment}`
}

export const parseExpr = (val: string) => {
	const [match, rawFrom, rawFromBP, rawTo, rawToBP, container, containerName] =
		val.match(
			/\/\* (?:not )?fluid from (.*?) at (.*?) to (.*?) at (.*?)(?: \((container)(?:: )?(.*?)\))?(?:;.*?)? \*\/$/
		) ?? []
	if (!match) return

	return {
		from: CSSLength.parse(rawFrom)!,
		fromBP: CSSLength.parse(rawFromBP)!,
		to: CSSLength.parse(rawTo)!,
		toBP: CSSLength.parse(rawToBP)!,
		container: (containerName as string | undefined) ?? Boolean(container),
		checkSC144: val.includes('WCAG SC 1.4.4')
	}
}

export const addVariant = (
	api: PluginAPI,
	variant: string,
	definition: string | string[] | ((extra: { container: Container }) => string | string[])
) =>
	api.addVariant(
		variant,
		// @ts-expect-error undocumented API
		definition
	)

export const matchVariant = <T = string>(
	api: PluginAPI,
	name: string,
	cb: (
		value: T | string,
		extra: { modifier: string | null; container: Container }
	) => string | string[],
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
	fn: (extra: { container: Container; modifier: string | null }) => void
) =>
	api.matchVariant(
		variant,
		// @ts-expect-error undocumented API
		(_, { modifier, container }) => fn({ modifier, container }),
		{
			values: { DEFAULT: null }
		}
	)
