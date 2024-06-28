// No-op for better type inference of tuples, without `as const` making things readonly
// see https://stackoverflow.com/a/64294629
export const tuple = <T extends [any, ...any]>(v: T) => v

export const unique = (iter: Iterable<any>) => new Set(iter).size
