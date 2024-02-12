declare module 'tailwindcss-priv/lib/corePlugins' {
    import { type PluginCreator } from 'tailwindcss-priv/types/config'
    export const corePlugins: Record<string, PluginCreator>
}

declare module 'tailwindcss-priv/src/util/dataTypes' {
    export function length(val: unknown): boolean
}