// TODO: incorporate
// https://github.com/tailwindlabs/tailwindcss/compare/v3.4.3...v3.4.6

import type { ExtractorFn } from "tailwindcss/types/config"
// @ts-expect-error untyped source file
import * as regex from 'tailwindcss-priv/src/lib/regex'

type ExtractorOptions = {
    separator?: string
    prefix?: string
}

let defaultPatterns

/** @internal */
export const DEFAULT_PREFIX = '', DEFAULT_SEPARATOR = ':', // these aren't available in `tailwindcss/defaultConfig`
PASSED_PREFIX = Symbol(), PASSED_SEPARATOR = Symbol(), IS_FLUID_EXTRACT = Symbol()

/**
 * Tailwind's default extractor, with small tweaks to support the ~ modifier.
 */
function extract(content: string): ReturnType<ExtractorFn>
function extract(options?: ExtractorOptions): ExtractorFn
function extract(contentOrOptions?: string | ExtractorOptions): ReturnType<ExtractorFn> | ExtractorFn {
  if (typeof contentOrOptions === 'string') {
    defaultPatterns ??= Array.from(buildRegExps())
    let results: string[] = []

    for (const pattern of defaultPatterns) {
      for (const result of contentOrOptions.match(pattern) ?? []) {
        results.push(clipAtBalancedParens(result))
      }
    }
    return results
  }

  const patterns = Array.from(buildRegExps(contentOrOptions))
  
  return Object.assign((content: string) => {
    let results: string[] = []

    for (const pattern of patterns) {
      for (const result of content.match(pattern) ?? []) {
        results.push(clipAtBalancedParens(result))
      }
    }

    return results
  }, {
    [IS_FLUID_EXTRACT]: true,
    [PASSED_PREFIX]: contentOrOptions?.prefix ?? DEFAULT_PREFIX,
    [PASSED_SEPARATOR]: contentOrOptions?.separator ?? DEFAULT_SEPARATOR
  })
}
extract[IS_FLUID_EXTRACT] = true

export default extract

function* buildRegExps({ separator = DEFAULT_SEPARATOR, prefix: _prefix = DEFAULT_PREFIX }: ExtractorOptions = {}) {
  const prefix = _prefix !== ''
      ? regex.optional(regex.pattern([/-?/, regex.escape(_prefix)]))
      : ''

    let utility = regex.any([
      // Arbitrary properties (without square brackets)
      /\[[^\s:'"`]+:[^\s\[\]]+\]/,

      // Arbitrary properties with balanced square brackets
      // This is a targeted fix to continue to allow theme()
      // with square brackets to work in arbitrary properties
      // while fixing a problem with the regex matching too much
      /\[[^\s:'"`\]]+:[^\s]+?\[[^\s]+\][^\s]+?\]/,
  
      // Utilities
      regex.pattern([
        // Utility Name / Group Name
        regex.any([
          /~?-?(?:\w+)/,
          //^ NEW

          // This is here to make sure @container supports everything that other utilities do
          /@(?:\w+)/,
        ]),
  
        // Normal/Arbitrary values
        regex.optional(
          regex.any([
            regex.pattern([
              // Arbitrary values
              regex.any([
                /-(?:\w+-)*\['[^\s]+'\]/,
                /-(?:\w+-)*\["[^\s]+"\]/,
                /-(?:\w+-)*\[`[^\s]+`\]/,
                /-(?:\w+-)*\[(?:[^\s\[\]]+\[[^\s\[\]]+\])*[^\s:\[\]]+\]/,
              ]),
  
              // Not immediately followed by an `{[(`
              /(?![{([]])/,

              // optionally followed by an opacity modifier
              /(?:\/[^\s'"`\\><$]*)?/,
            ]),
  
            regex.pattern([
              // Arbitrary values
              regex.any([
                /-(?:\w+-)*\['[^\s]+'\]/,
                /-(?:\w+-)*\["[^\s]+"\]/,
                /-(?:\w+-)*\[`[^\s]+`\]/,
                /-(?:\w+-)*\[(?:[^\s\[\]]+\[[^\s\[\]]+\])*[^\s\[\]]+\]/,
              ]),

              // Not immediately followed by an `{[(`
              /(?![{([]])/,

              // optionally followed by an opacity modifier
              /(?:\/[^\s'"`\\$]*)?/,
            ]),
  
            // Normal values w/o quotes — may include an opacity modifier
            /[-\/][^\s'"`\\$={><]*/,
          ])
        ),
      ]),
    ])
  
    let variantPatterns = [
      // Without quotes
      regex.any([
        // This is here to provide special support for the `@[]` variant
        regex.pattern([/~?@\[[^\s"'`]+\](\/[^\s"'`]+)?/, separator]),
        //              ^ NEW:

        // NEW: ~/[arbitrary] and ~@/[arbitrary]
        regex.pattern([/~@?(\w+)?\/\[[^\s"'`]+\]/, separator]),


        // With variant modifier (e.g.: group-[..]/modifier)
        regex.pattern([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]\/[\w_-]+/, separator]),

        regex.pattern([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]/, separator]),
        regex.pattern([/[^\s"'`\[\\]+/, separator]),
      ]),
  
      // With quotes allowed
      regex.any([
        // With variant modifier (e.g.: group-[..]/modifier)
        regex.pattern([/([^\s"'`\[\\]+-)?\[[^\s`]+\]\/[\w_-]+/, separator]),

        regex.pattern([/([^\s"'`\[\\]+-)?\[[^\s`]+\]/, separator]),
        regex.pattern([/[^\s`\[\\]+/, separator]),
      ]),
    ]
  
    for (const variantPattern of variantPatterns) {
      yield regex.pattern([
        // Variants
        '((?=((',
        variantPattern,
        ')+))\\2)?',
  
        // Important (optional)
        /!?/,
  
        prefix,
  
        utility,
      ])
    }
  
    // 5. Inner matches
    yield /[^<>"'`\s.(){}[\]#=%$][^<>"'`\s(){}[\]#=%$]*[^<>"'`\s.(){}[\]#=%:$]/g
  }
  
  // We want to capture any "special" characters
  // AND the characters immediately following them (if there is one)
  let SPECIALS = /([\[\]'"`])([^\[\]'"`])?/g
  let ALLOWED_CLASS_CHARACTERS = /[^"'`\s<>\]]+/
  
  /**
   * Clips a string ensuring that parentheses, quotes, etc… are balanced
   * Used for arbitrary values only
   *
   * We will go past the end of the balanced parens until we find a non-class character
   *
   * Depth matching behavior:
   * w-[calc(100%-theme('spacing[some_key][1.5]'))]']
   *   ┬    ┬          ┬┬       ┬        ┬┬   ┬┬┬┬┬┬┬
   *   1    2          3        4        34   3 210 END
   *   ╰────┴──────────┴────────┴────────┴┴───┴─┴┴┴
   *
   * @param {string} input
   */
  function clipAtBalancedParens(input: string) {
    // We are care about this for arbitrary values
    if (!input.includes('-[')) {
      return input
    }
  
    let depth = 0
    let openStringTypes: string[] = []
  
    // Find all parens, brackets, quotes, etc
    // Stop when we end at a balanced pair
    // This is naive and will treat mismatched parens as balanced
    // This shouldn't be a problem in practice though
    const rawMatches = input.matchAll(SPECIALS)
  
    // We can't use lookbehind assertions because we have to support Safari
    // So, instead, we've emulated it using capture groups and we'll re-work the matches to accommodate
    const matches = Array.from(rawMatches).flatMap((match) => {
      const [, ...groups] = match
  
      return groups.map((group, idx) =>
        Object.assign([], match, {
          index: match.index! + idx,
          0: group,
        })
      )
    })
  
    for (let match of matches) {
      let char = match[0]
      let inStringType = openStringTypes[openStringTypes.length - 1]
  
      if (char === inStringType) {
        openStringTypes.pop()
      } else if (char === "'" || char === '"' || char === '`') {
        openStringTypes.push(char)
      }
  
      if (inStringType) {
        continue
      } else if (char === '[') {
        depth++
        continue
      } else if (char === ']') {
        depth--
        continue
      }
  
      // We've gone one character past the point where we should stop
      // This means that there was an extra closing `]`
      // We'll clip to just before it
      if (depth < 0) {
        return input.substring(0, match.index - 1)
      }
  
      // We've finished balancing the brackets but there still may be characters that can be included
      // For example in the class `text-[#336699]/[.35]`
      // The depth goes to `0` at the closing `]` but goes up again at the `[`
  
      // If we're at zero and encounter a non-class character then we clip the class there
      if (depth === 0 && !ALLOWED_CLASS_CHARACTERS.test(char)) {
        return input.substring(0, match.index)
      }
    }
  
    return input
  }
  
  // Regular utilities
  // {{modifier}:}*{namespace}{-{suffix}}*{/{opacityModifier}}?
  
  // Arbitrary values
  // {{modifier}:}*{namespace}-[{arbitraryValue}]{/{opacityModifier}}?
  // arbitraryValue: no whitespace, balanced quotes unless within quotes, balanced brackets unless within quotes
  
  // Arbitrary properties
  // {{modifier}:}*[{validCssPropertyName}:{arbitraryValue}]