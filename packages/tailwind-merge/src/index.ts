import { mergeConfigs, type Config } from 'tailwind-merge'

const fluidValidator = (value: string) => {
	const parts = value.split('/')
	return parts.length >= 2
}

export function withFluid(config: Config<string, string>) {
	if (config.prefix)
		throw new Error(`@fluid-tailwind/tailwind-merge doesn't work with custom prefixes`)

	const classGroups = Object.fromEntries(
		Object.entries(config.classGroups).map(([name, group]) => {
			return [
				name,
				group
					.filter((def) => typeof def === 'object')
					.map((obj) =>
						Object.fromEntries(
							Object.entries(obj).flatMap(([name, defs]) => [
								[`~${name}`, [fluidValidator]],
								[`~-${name}`, [fluidValidator]]
							])
						)
					)
			]
		})
	)

	return mergeConfigs(config, {
		extend: {
			classGroups
		}
	})
}
