declare module 'bun:test' {
  interface AsymmetricMatchers {
    toMatchFormattedCss(expected: string): void;
  }
  interface Matchers<R> {
    toMatchFormattedCss(expected: string): R;
  }
}

export {}