import path from 'path'
import postcss from 'postcss'
import tailwind, { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'
import {
	fluidCorePlugins,
	fluidExtractor,
	defaultThemeFontSizeInRems,
	defaultThemeScreensInRems
} from '../src'
import { expect, spyOn } from 'bun:test'
import * as log from '../src/util/log'

export let css = String.raw
export let html = String.raw
export let javascript = String.raw

export async function run(config: Config, input = `@tailwind utilities;@tailwind components;`) {
	if (Array.isArray(config.content)) {
		config.content = {
			files: config.content,
			extract: fluidExtractor()
		}
	} else {
		config.content.extract ??= fluidExtractor()
	}

	config.corePlugins ??= {}
	if (!Array.isArray(config.corePlugins)) config.corePlugins.preflight ??= false

	config.theme ??= {}
	config.theme.fontSize ??= defaultThemeFontSizeInRems
	config.theme.screens ??= defaultThemeScreensInRems

	config.plugins ??= []
	if (!config.plugins.includes(fluidCorePlugins)) {
		config.plugins.push(fluidCorePlugins)
	}
	if (!config.plugins.includes(containerQueries)) {
		config.plugins.push(containerQueries)
	}

	return await postcss(tailwind(config)).process(input, {
		from: `${path.resolve(__filename)}?test=${crypto.randomUUID()}`
	})
}
