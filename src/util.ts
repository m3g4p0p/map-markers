export function filterObject<T = any>
  (source: object, predicate: (key: string, value: T) => boolean) {
  return Object.entries(source).reduce((result, [key, value]) => ({
    ...result,
    ...predicate(key, value) ? { [key]: value } : {}
  }), {})
}
