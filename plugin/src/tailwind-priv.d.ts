// Types for undocumented Tailwind APIs

declare module 'tailwindcss/lib/corePlugins' {
	import { type PluginCreator } from 'tailwindcss/types/config'
	export const corePlugins: Record<string, PluginCreator>
}
