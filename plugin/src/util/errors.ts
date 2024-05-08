import { Length } from './css'

export type Severity = 'warn' | 'error'

export const codes = {
	'missing-start': () => 'Missing start value',
	'missing-end': () => 'Missing end value',
	'missing-default-start-bp': () => 'Missing default start breakpoint',
	'missing-default-end-bp': () => 'Missing default end breakpoint',
	'non-length-start': (start: string) => `Start value \`${start}\` is not a length`,
	'non-length-end': (end: string) => `End value \`${end}\` is not a length`,
	'non-length-start-bp': (bp: string) => `Start breakpoint \`${bp}\` is not a length`,
	'non-length-end-bp': (bp: string) => `End breakpoint \`${bp}\` is not a length`,
	'sort-mismatched-bp-units': (key: string) =>
		`Cannot sort simple breakpoints in \`theme.${key}\` because they use different units`,
	'mismatched-bp-units': (start: Length, end: Length) =>
		`Start breakpoint \`${start.cssText}\` and end breakpoint \`${end.cssText}\` units don't match`,
	'mismatched-bp-val-units': () => `Breakpoint and value units don't match`,
	'mismatched-units': (start: Length, end: Length) =>
		`Start \`${start.cssText}\` and end \`${end.cssText}\` units don't match`,
	'no-change': (val: Length) => `Start and end values are both ${val.cssText}`,
	'no-change-bp': (val: Length) => `Start and end breakpoints are both ${val.cssText}`,
	'bp-not-found': (key: string, name: string) => `Could not find \`theme.${key}.${name}\``,
	'no-utility': () => 'Fluid variants can only be used with fluid utilities',
	'fails-sc-144': (failingBp: Length) => `Fails WCAG SC 1.4.4 at i.e. ${failingBp.cssText}`
} satisfies Record<string, (...args: any[]) => string>

export class FluidError extends Error {
	name = 'FluidError'

	constructor(
		public code: keyof typeof codes,
		message: string
	) {
		super(message)
	}
}

export function error<C extends keyof typeof codes>(
	code: C,
	...args: Parameters<(typeof codes)[C]>
): never {
	const fn = codes[code]

	// @ts-expect-error
	const message = fn(...args)

	throw new FluidError(code, message)
}
