// Types for undocumented Tailwind APIs

declare module 'tailwindcss-priv/lib/corePlugins' {
	import { type PluginCreator } from 'tailwindcss-priv/types/config'
	export const corePlugins: Record<string, PluginCreator>
}

declare module 'tailwindcss-priv/lib/util/log' {
	type LogFn = (key: string | string[], messages: string[]) => void

	declare const log: {
		info: LogFn
		warn: LogFn
		risk: LogFn
	}
	export default log
}
