// Types for undocumented Tailwind APIs

declare module 'tailwindcss-priv/lib/corePlugins' {
	import type { PluginCreator } from 'tailwindcss-priv/types/config'
	export const corePlugins: Record<string, PluginCreator>
}
