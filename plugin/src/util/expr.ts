import { Root } from 'postcss'
import { Length, type RawValue } from './css'
import { FluidError, codes, error } from './errors'
import { clamp, precision, toPrecision } from './math'
import type { Context } from './context'

// Convert a RawValue to a length, which also resolves theme() values
const length = (val: RawValue | Length, { theme }: Context) => {
	if (val instanceof Length) return val
	if (typeof val === 'string') {
		// Test if it's a theme() function
		const [, lookup] = val.match(/^\s*theme\((.*?)\)\s*$/) ?? []
		if (lookup) val = theme(lookup)
	}
	return Length.parse(val)
}

const resolveBP = (
	bp: RawValue | Length,
	type: 'start' | 'end',
	context: Context,
	atContainer?: string | true
) => {
	if (!bp) {
		bp =
			context[`default${type === 'start' ? 'Start' : 'End'}${atContainer ? 'Container' : 'Screen'}`]
		if (!bp) error(`missing-default-${type}-bp`)
	}
	if (bp instanceof Length) return bp
	const len = length(bp, context)
	if (!len) error(`non-length-${type}-bp`, bp as string)
	return len
}

export const generate = (
	_start: RawValue | Length,
	_end: RawValue | Length,
	context: Context,
	{
		startBP: _startBP,
		endBP: _endBP,
		atContainer,
		type = false,
		final = false,
		negate = false
	}: {
		startBP?: RawValue | Length
		endBP?: RawValue | Length
		atContainer?: string | true | undefined
		type?: boolean
		final?: boolean
		negate?: boolean
	} = {}
) => {
	if (!_start) error('missing-start')
	const start = length(_start, context)
	if (!start) error('non-length-start', _start as string)

	if (!_end) error('missing-end')
	const end = length(_end, context)
	if (!end) error('non-length-end', _end as string)

	const startBP = resolveBP(_startBP, 'start', context, atContainer)
	const endBP = resolveBP(_endBP, 'end', context, atContainer)

	if (start.number === 0) start.unit = end.unit
	else if (end.number === 0) end.unit = start.unit
	else if (!start.unit || start.unit !== end.unit) error('mismatched-units', start, end)
	const unit = start.unit

	if (start.number === end.number) error('no-change', start)

	if (negate) {
		start.number *= -1
		end.number *= -1
	}

	const comment = <C extends keyof typeof codes>(
		code?: C,
		...args: typeof code extends undefined ? never : Parameters<(typeof codes)[C]>
	) =>
		`/* ${code ? 'not ' : ''}fluid${type ? ' type' : ''} from ${start.cssText} at ${startBP.cssText} to ${end.cssText} at ${endBP.cssText}${atContainer ? ' (container)' : ''}${
			// @ts-expect-error
			code ? ': ' + codes[code](...args) : ''
		} */`

	if (startBP.number === 0) {
		startBP.unit = endBP.unit
	} else if (endBP.number === 0) {
		endBP.unit = startBP.unit
	} else if (!startBP.unit || startBP.unit !== endBP.unit) {
		return (final ? error : comment)('mismatched-bp-units', startBP, endBP)
	}

	if (startBP.number === endBP.number) {
		return (final ? error : comment)('no-change-bp', startBP)
	}

	if (start.unit !== startBP.unit) {
		return (final ? error : comment)('mismatched-bp-val-units')
	}

	const p = Math.max(
		precision(start.number),
		precision(startBP.number),
		precision(end.number),
		precision(endBP.number),
		2
	)

	const min = `${Math.min(start.number, end.number)}${unit}` // CSS requires the min < max in a clamp
	const max = `${Math.max(start.number, end.number)}${unit}` // CSS requires the min < max in a clamp
	const slope = (end.number - start.number) / (endBP.number - startBP.number)
	const intercept = start.number - startBP.number * slope

	// SC 1.4.4 check
	if (type && context.checkSC144) {
		const zoom1 = (vw: number) => clamp(start.number, intercept + slope * vw, end.number) // 2*zoom1(vw) is the AA requirement
		const zoom5 = (vw: number) =>
			clamp(5 * start.number, 5 * intercept + slope * vw, 5 * end.number) // browser doesn't scale vw units when zooming, so this isn't 5*zoom1(vw)

		// Check the clamped points on the lines 2*z1(vw) and zoom5(vw) and fail if zoom5 < 2*zoom1
		if (5 * start.number < 2 * zoom1(5 * startBP.number))
			return (final ? error : comment)('fails-sc-144', new Length(startBP.number * 5, startBP.unit)) // fails at 5*startBP
		else if (zoom5(endBP.number) < 2 * end.number)
			return (final ? error : comment)('fails-sc-144', endBP)
	}

	return `clamp(${min},${toPrecision(intercept, p)}${unit} + ${toPrecision(slope * 100, p)}${atContainer ? 'cqw' : 'vw'},${max})${comment()}`
}

export const rewrite = (
	container: Root,
	context: Context,
	[startBP, endBP]: [Length | RawValue, Length | RawValue],
	atContainer?: string | true
) => {
	const contextKey = atContainer ? 'containers' : 'screens'
	endBP = (() => {
		if (typeof endBP !== 'string') return endBP
		// Check if it's [arbitrary] (i.e. from a modifier)
		if (/^\[(.*?)\]$/.test(endBP)) {
			return endBP.match(/^\[(.*?)\]$/)?.[1]
		} else {
			const bp = context[contextKey][endBP]
			if (!bp) error('bp-not-found', contextKey, endBP)
			return bp
		}
	})()

	// Check first to see if this was a fluid utility that errored
	let failedFluid: string | undefined
	container.walkRules((rule) => {
		failedFluid = rule.selector.match(/~.*?\/\* error - (.*?) \*\/\s*$/)?.[1]
		if (failedFluid) return false
	})
	if (failedFluid) throw new FluidError(failedFluid)

	// Walk through each `property: value` and rewrite any fluid expressions
	let foundExpr = false
	container.walkDecls((decl) => {
		decl.value = decl.value.replaceAll(
			/(?:clamp\(.*?\))?\/\* (?:not )?fluid( type)? from (.*?) at (.*?) to (.*?) at (.*?)(?: \((container)(?:: )?(.*?)\))?(?:;.*?)? \*\//g,
			(match, type, rawStart, _, rawEnd, __, ___, ____) => {
				foundExpr = true
				return generate(rawStart, rawEnd, context, {
					startBP,
					endBP,
					atContainer,
					type: Boolean(type),
					final: true
				})
			}
		)
	})
	// Prevent rules like ~md/lg:relative
	if (!foundExpr) error('no-utility')
}
