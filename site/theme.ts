// Theme values that need to be imported elsewhere
// (separate file is better for tree-shaking)

import defaultTheme from 'tailwindcss/defaultTheme'

export const sans = ['"Inter var"', ...defaultTheme.fontFamily.sans]
export const mono = ['"Fira Code VF"', ...defaultTheme.fontFamily.mono]
