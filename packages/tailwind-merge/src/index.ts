import { mergeConfigs, validators, type Config } from 'tailwind-merge'

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never
type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export function withFluid(config: Config<string, string>) {
	if (config.prefix)
		throw new Error(`@fluid-tailwind/tailwind-merge doesn't work with custom prefixes`)

	// const buildFluidValidator =
	// 	(defs: Exclude<ClassDefinition, ClassObject | ThemeGetter>[]) => (val: string) => {
	// 		// TODO: this won't handle values with `/` in them
	// 		const parts = val.split('/')
	// 		console.log('parts', defs, parts)
	// 		return (
	// 			parts.length === 2 &&
	// 			parts.every((v) => defs.every((d) => (typeof d === 'string' ? d === v : d(v))))
	// 		)
	// 	}

	type ClassGroupKeys = keyof typeof config.classGroups
	type ClassGroup = (typeof config.classGroups)[ClassGroupKeys]
	type ClassDefinition = ArrayElement<ClassGroup>
	type ClassObject = Exclude<ClassDefinition, string | Function>
	interface ThemeGetter {
		(theme: (typeof config)['theme']): ClassGroup
		isThemeGetter: true
	}
	const fluidizeClassObject = (obj: ClassObject, toplevel = false): ClassObject =>
		Object.fromEntries(
			Object.entries(obj).flatMap(([name, defs]) => {
				// Resolve theme getters, then flatten:
				const allDefs = defs
					.map((def) => {
						// Resolve objects
						if (typeof def === 'object') {
							return fluidizeClassObject(def)
						}
						// Resolve theme getters
						if (typeof def === 'function' && 'isThemeGetter' in def && def.isThemeGetter) {
							return def(config.theme)
						}
						return def
					})
					.flat() as Exclude<ClassDefinition, ThemeGetter>[] // TS can't infer this

				// Skip the whole thing if it doesn't include either arbitrary validator, meaning
				// it isn't a matchUtility/matchComponent
				if (
					!allDefs.includes(validators.isArbitraryLength) &&
					!allDefs.includes(validators.isArbitraryValue)
				)
					return [[name, defs]]

				// Deeply resolve any remaining objects:
				const newDefs = [
					...defs.filter((def) => typeof def !== 'object'),
					...defs.filter((def) => typeof def === 'object').map((def) => fluidizeClassObject(def))
				]

				return toplevel
					? [
							[`~${name}`, newDefs],
							[`~-${name}`, newDefs]
						]
					: [[name, newDefs]]
			})
		)

	const classGroups = Object.fromEntries(
		Object.entries(config.classGroups).map(([name, group]) => {
			return [
				name,
				group.filter((def) => typeof def === 'object').map((def) => fluidizeClassObject(def, true))
			]
		})
	)

	return mergeConfigs(config, {
		extend: {
			classGroups
		}
	})
}
