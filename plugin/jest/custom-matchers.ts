import prettier from 'prettier'
import { expect } from '@jest/globals'
import { diff } from 'jest-diff'

const format = (input: string) =>
	prettier.format(input, {
		parser: 'css',
		printWidth: 100
	})

expect.extend({
	// Compare two CSS strings with all whitespace removed
	// This is probably naive but it's fast and works well enough.
	async toMatchCss(received: string, argument: string) {
		function stripped(str: string) {
			return str.replace(/\s/g, '').replace(/;/g, '')
		}

		const options = {
			comment: 'stripped(received) === stripped(argument)',
			isNot: this.isNot,
			promise: this.promise
		}

		const pass = stripped(received) === stripped(argument)

		const message = pass
			? () => {
					return (
						this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
						'\n\n' +
						`Expected: not ${this.utils.printExpected(format(received))}\n` +
						`Received: ${this.utils.printReceived(format(argument))}`
					)
				}
			: () => {
					const diffString = diff(argument, received, {
						expand: this.expand
					})

					return (
						this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
						'\n\n' +
						(diffString && diffString.includes('- Expect')
							? `Difference:\n\n${diffString}`
							: `Expected: ${this.utils.printExpected(argument)}\n` +
								`Received: ${this.utils.printReceived(received)}`)
					)
				}

		return { actual: received, message, pass }
	},
	toIncludeCss(received: string, argument: string) {
		function stripped(str: string) {
			return str.replace('/* prettier-ignore */', '').replace(/\s/g, '').replace(/;/g, '')
		}

		const options = {
			comment: 'stripped(received).includes(stripped(argument))',
			isNot: this.isNot,
			promise: this.promise
		}

		const pass = stripped(received).includes(stripped(argument))

		const message = pass
			? () => {
					return (
						this.utils.matcherHint('toIncludeCss', undefined, undefined, options) +
						'\n\n' +
						`Expected: not ${this.utils.printExpected(format(received))}\n` +
						`Received: ${this.utils.printReceived(format(argument))}`
					)
				}
			: () => {
					const diffString = diff(argument, received, {
						expand: this.expand
					})

					return (
						this.utils.matcherHint('toIncludeCss', undefined, undefined, options) +
						'\n\n' +
						(diffString && diffString.includes('- Expect')
							? `Difference:\n\n${diffString}`
							: `Expected: ${this.utils.printExpected(argument)}\n` +
								`Received: ${this.utils.printReceived(received)}`)
					)
				}

		return { actual: received, message, pass }
	},
	// Compare two CSS strings with all whitespace removed
	// This is probably naive but it's fast and works well enough.
	async toMatchFormattedCss(received: string = '', argument: string = '') {
		function stripped(str: string) {
			return str
				.replace(/\/\* ! tailwindcss .* \*\//, '')
				.replace(/\s/g, '')
				.replace(/;/g, '')
		}

		const options = {
			comment: 'stripped(received) === stripped(argument)',
			isNot: this.isNot,
			promise: this.promise
		}

		const formattedReceived = await format(received.replace(/\n/g, ''))
		const formattedArgument = await format(argument.replace(/\n/g, ''))

		const pass = stripped(formattedReceived) === stripped(formattedArgument)

		const message = pass
			? () => {
					return (
						this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
						'\n\n' +
						`Expected: not ${this.utils.printExpected(formattedReceived)}\n` +
						`Received: ${this.utils.printReceived(formattedArgument)}`
					)
				}
			: () => {
					const actual = formattedReceived
					const expected = formattedArgument

					const diffString = diff(expected, actual, {
						expand: this.expand
					})

					return (
						this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
						'\n\n' +
						(diffString && diffString.includes('- Expect')
							? `Difference:\n\n${diffString}`
							: `Expected: ${this.utils.printExpected(expected)}\n` +
								`Received: ${this.utils.printReceived(actual)}`)
					)
				}

		return { actual: received, message, pass }
	}
})
