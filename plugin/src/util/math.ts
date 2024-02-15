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
