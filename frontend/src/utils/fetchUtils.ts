import { flow, isBoolean, isEmpty, isNil, isNumber, pickBy } from 'lodash-es';

export const getURLQuery = (params: object): string => {
  if (isEmpty(params)) {
    return '';
  }

  return flow([
    // Faster than omitBy
    (params) =>
      pickBy(params, (value) => {
        return (
          !isNil(value) &&
          (isBoolean(value) || isNumber(value) || !isEmpty(value))
        );
      }),
    (params: Record<string, string>) => new URLSearchParams(params),
    (params) => (params.toString().length > 0 ? `?${params}` : '')
  ])(params);
};
