import { mergeConfigs, type Config } from 'tailwind-merge'

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export function withFluid(config: Config<string, string>) {
	if (config.prefix)
		throw new Error(`@fluid-tailwind/tailwind-merge doesn't work with custom prefixes`)

	type ClassGroupKeys = keyof typeof config.classGroups
	type ClassGroup = (typeof config.classGroups)[ClassGroupKeys]
	type ClassDefinition = ArrayElement<ClassGroup>
	type ClassObject = Exclude<ClassDefinition, string | Function>
	interface ThemeGetter {
		(theme: (typeof config)['theme']): ClassGroup
		isThemeGetter: true
	}
	// TS needs the explicit predicate here:
	const isThemeGetter = (def: ClassDefinition): def is ThemeGetter =>
		typeof def === 'function' && 'isThemeGetter' in def && def.isThemeGetter
	type ClassValidator = (val: string) => boolean

	const buildFluidValidator =
		(defs: Exclude<ClassDefinition, ClassObject | ThemeGetter>[]): ClassValidator =>
		(val) => {
			// TODO: this won't handle values with `/` in them, but TW chokes on those anyway
			const parts = val.split('/')
			return (
				parts.length === 2 &&
				defs.length > 0 &&
				parts.every((v) => defs.some((d) => (typeof d === 'string' ? d === v : d(v))))
			)
		}

	const resolveThemeGetters = (group: ClassGroup): Exclude<ClassDefinition, ThemeGetter>[] =>
		group.flatMap((def) => (isThemeGetter(def) ? resolveThemeGetters(def(config.theme)) : [def]))

	const fluidizeClassGroup = (
		group: ClassGroup,
		toplevel = false
	): [fluidValidator: ClassValidator, ...ClassObject[]] => {
		// Separate class objects from other defs:
		const objDefs: ClassObject[] = []
		const nonObjDefs: Exclude<ClassDefinition, ThemeGetter | ClassObject>[] = []

		// Resolve theme getters first
		resolveThemeGetters(group).forEach((def) => {
			if (typeof def !== 'object') return !toplevel && nonObjDefs.push(def)

			objDefs.push(
				Object.fromEntries(
					Object.entries(def).flatMap(([name, defs]) => {
						const newDefs = fluidizeClassGroup(defs)
						return toplevel
							? [
									[`~${name}`, newDefs],
									[`~-${name}`, newDefs]
								]
							: [[name, newDefs]]
					})
				)
			)
		})

		return [buildFluidValidator(nonObjDefs), ...objDefs]
	}

	const classGroups = Object.fromEntries(
		Object.entries(config.classGroups).map(([name, group]) => {
			return [name, fluidizeClassGroup(group, true).slice(1)]
		})
	)

	return mergeConfigs(config, {
		extend: {
			classGroups,
			ignoredVariants: [(variant) => variant.startsWith('~')]
		}
	})
}
