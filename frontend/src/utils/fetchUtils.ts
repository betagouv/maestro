import fp from 'lodash/fp';

export const getURLQuery = (params: object): string => {
  if (fp.isEmpty(params)) {
    return '';
  }

  return fp.pipe(
    // Faster than fp.omitBy
    fp.pickBy((value) => {
      return (
        !fp.isNil(value) &&
        (fp.isBoolean(value) || fp.isNumber(value) || !fp.isEmpty(value))
      );
    }),
    (params: Record<string, string>) => new URLSearchParams(params),
    (params) => (params.toString().length > 0 ? `?${params}` : '')
  )(params);
};
