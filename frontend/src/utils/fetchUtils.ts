import { flow, isBoolean, isEmpty, isNil, isNumber, pickBy } from 'lodash-es';
import type { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';

export const getURLQuery = (
  params: FindSampleOptions | FindPrescriptionOptions | { page: string }
): string => {
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
