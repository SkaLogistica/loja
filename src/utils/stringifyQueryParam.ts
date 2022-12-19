export function stringifyQueryParam(arg: string[] | string | undefined) {
  if (arg === undefined) return ''
  if (Array.isArray(arg)) return arg[0] ?? ''
  return arg
}
