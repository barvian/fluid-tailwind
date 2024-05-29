import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'
import nodeExternals from 'rollup-plugin-node-externals'

export default defineConfig({
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/index.mjs',
			format: 'es'
		},
		{
			file: 'dist/index.js',
			format: 'cjs'
		}
	],
	plugins: [
		{
			name: 'transform-imports-in-corePlugins',
			resolveId: {
				order: 'pre',
				handler(id, parentId, options) {
					// Remove Node built-ins b/c Skypack seems to choke on them:
					if (
						(parentId?.includes('/postcss/') ||
							parentId?.endsWith('/src/corePlugins.js') ||
							parentId?.includes('/postcss-selector-parser/')) &&
						(id === 'fs' ||
							id === 'url' ||
							id === 'path' ||
							id === 'util' ||
							id.includes('/util-deprecate/'))
					)
						return '\0corePlugins:noop'
				}
			},
			load(id) {
				if (id === '\0corePlugins:noop') return 'export default function() {}'
			}
		},
		nodeExternals({
			builtinsPrefix: 'strip', // for skypack, which adds them on top
			exclude: 'tailwindcss-priv' // which is to say, don't mark it as external
		}),
		typescript(),
		json(),
		resolve(),
		commonjs()
	]
})
