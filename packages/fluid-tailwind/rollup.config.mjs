import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'
import nodeExternals from 'rollup-plugin-node-externals'
import del from 'rollup-plugin-delete'

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
		del({
			targets: ['dist/*']
		}),
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
			builtinsPrefix: 'strip', // for Skypack, which adds them on top
			exclude: [
				'map-obj', 'filter-obj', // https://github.com/barvian/fluid-tailwind/issues/39
				'tailwindcss-priv' // for Skypack, which can't handle importing tailwindcss
			] 
		}),
		typescript({
			noEmitOnError: true,
			exclude: ['tests/**/*.ts']
		}),
		json(),
		resolve(),
		commonjs()
	]
})
