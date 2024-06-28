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

it(`doesn't add static utilities`, () => {
	expect(twMerge('self-auto ~self-auto/baseline')).toBe('self-auto ~self-auto/baseline')
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

it(`doesn't handles static class groups`, () => {
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
