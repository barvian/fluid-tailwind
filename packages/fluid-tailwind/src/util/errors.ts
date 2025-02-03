export const codes = {
	'sort-mismatched-bp-units': (key: string) =>
		`Cannot sort simple breakpoints in \`theme.${key}\` because they use different units`,
} satisfies Record<string, (...args: any[]) => string>

export class FluidError extends Error {
	override name = 'FluidError'

	static fromCode<C extends keyof typeof codes>(code: C, ...args: Parameters<(typeof codes)[C]>) {
		const fn = codes[code]

		// @ts-expect-error
		const message = fn(...args)

		return new this(message)
	}
}

export function error<C extends keyof typeof codes>(
	code: C,
	...args: Parameters<(typeof codes)[C]>
): never {
	throw FluidError.fromCode(code, ...args)
}
