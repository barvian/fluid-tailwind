/// <reference path=".astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'remark-sectionize' {
	import type { RemarkPlugin } from 'astro'
	declare const plugin: RemarkPlugin
	export default plugin
}
