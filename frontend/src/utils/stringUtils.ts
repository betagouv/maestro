export function pluralize(
  count: number,
  replacements?: { old: string; new: string }[]
) {
  return (str: string): string =>
    str
      .split(' ')
      .map((s) =>
        count > 1 ? replacements?.find((_) => _.old === s)?.new ?? `${s}s` : s
      )
      .join(' ');
}
