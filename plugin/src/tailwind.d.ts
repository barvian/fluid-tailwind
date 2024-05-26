// Types for undocumented Tailwind APIs

declare module 'tailwindcss/src/corePlugins' {
	import type { PluginCreator } from 'tailwindcss/types/config'
	export const corePlugins: Record<string, PluginCreator>
}
