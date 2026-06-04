export const serializeQuery = (params: Record<string, unknown>): string => {
  const entries = Object.entries(params).filter(([, value]) => {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });

  if (entries.length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams(
    Object.fromEntries(entries) as Record<string, string>
  );
  const serialized = searchParams.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
};
