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
export class Length {
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
