export function pluralize(
  count: number,
  options?: {
    replacements?: { old: string; new: string }[];
    preserveCount?: boolean;
    ignores?: string[];
  }
) {
  return (str: string): string =>
    [
      ...(options?.preserveCount ? [count] : []),
      ...str
        .split(' ')
        .map((s) =>
          count > 1
            ? (options?.replacements?.find((_) => _.old === s)?.new ??
              (options?.ignores?.includes(s) ? s : `${s}s`))
            : s
        )
    ].join(' ');
}

export const quote = (str: string): string => `“ ${str} “`;

export const cropFileName = (fileName: string, maxLength: number): string => {
  const lastDotIndex = fileName.lastIndexOf('.') - 1;

  if (lastDotIndex === -1) {
    return fileName.length > maxLength
      ? fileName.slice(0, maxLength - 3) + '...'
      : fileName;
  }

  const name = fileName.slice(0, lastDotIndex);
  const extension = fileName.slice(lastDotIndex);

  if (fileName.length <= maxLength) {
    return fileName;
  }

  if (extension.length >= maxLength) {
    return '...' + extension.slice(extension.length - maxLength + 3);
  }

  const nameMaxLength = maxLength - extension.length - 3;
  return name.slice(0, nameMaxLength) + '...' + extension;
};
