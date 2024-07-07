# @fluid-tailwind/tailwind-merge

The official tailwind-merge plugin for `fluid-tailwind`.

## Installation

Install the plugin:

```sh
npm install --save @fluid-tailwind/tailwind-merge
```

Then include it after any other [tailwind-merge plugins](https://github.com/dcastil/tailwind-merge/blob/v2.3.0/docs/configuration.md#using-tailwind-merge-plugins):

```js
import { extendTailwindMerge } from 'tailwind-merge'
import { withFluid } from '@fluid-tailwind/tailwind-merge'

export const twMerge = extendTailwindMerge(/* ... */, withFluid)
```
