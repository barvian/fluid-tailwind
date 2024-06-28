import { twMerge } from './helper'
import { it, expect } from 'bun:test'
import { extendTailwindMerge, validators } from 'tailwind-merge'
import { withFluid } from '../src'

it('errors if the prefix is set', () => {
	expect(() => {
		const twMerge = extendTailwindMerge({ prefix: 'tw-' }, withFluid)
		twMerge('m-1 m-2')
	}).toThrow()
})

it('validates fluid utilities correctly', () => {
	expect(twMerge('relative ~relative')).toBe('relative ~relative')
	expect(twMerge('m-[2px] ~m-[2px]')).toBe('m-[2px] ~m-[2px]')
	expect(twMerge('m-[2px] ~m-[2px]/_nonexistent')).toBe('m-[2px] ~m-[2px]/_nonexistent')
	expect(twMerge('m-[2px] ~m-[2px]/auto')).toBe('~m-[2px]/auto')
	const twMergeWithTheme = extendTailwindMerge<'test'>(
		{
			extend: {
				theme: {
					spacing: ['big']
				}
			}
		},
		withFluid
	)
	expect(twMergeWithTheme('m-[2px] ~m-[2px]/big')).toBe('~m-[2px]/big')
	expect(twMergeWithTheme('m-[2px] ~m-[2px]/_nonexistent')).toBe('m-[2px] ~m-[2px]/_nonexistent')
})

it(`handles custom class groups`, () => {
	const twMerge = extendTailwindMerge<'test'>(
		{
			extend: {
				classGroups: {
					test: [
						{
							test: [validators.isArbitraryLength]
						}
					]
				}
			}
		},
		withFluid
	)
	expect(twMerge('test-[2px] ~test-[2px]/[3px]')).toBe('~test-[2px]/[3px]')
})

it(`doesn't handle static class groups`, () => {
	const twMerge = extendTailwindMerge<'test'>(
		{
			extend: {
				classGroups: {
					test: [{ test: ['auto'] }]
				}
			}
		},
		withFluid
	)
	expect(twMerge('test-[2px] ~test-[2px]/[3px]')).toBe('test-[2px] ~test-[2px]/[3px]')
})

it('handles arbitrary length conflicts correctly', () => {
	expect(twMerge('m-[2px] ~m-[2px]/[3px]')).toBe('~m-[2px]/[3px]')
})

it('handles negative fluid utilities', () => {
	expect(twMerge('m-[2px] ~-m-[2px]/[3px]')).toBe('~-m-[2px]/[3px]')
})

// https://github.com/barvian/fluid-tailwind/discussions/29
it('works with variants', () => {
	expect(twMerge('~text-base/lg sm:~sm:~text-lg/xl ~text-2xl/3xl sm:~sm:~text-3xl/4xl')).toBe(
		'~text-2xl/3xl sm:~sm:~text-3xl/4xl'
	)
	expect(twMerge('text-base sm:text-lg ~text-2xl/3xl sm:~sm:~text-3xl/4xl')).toBe(
		'sm:text-lg ~text-2xl/3xl sm:~sm:~text-3xl/4xl' // TODO: ideally this should be '~text-2xl/3xl sm:~sm:~text-3xl/4xl'
	)
})
