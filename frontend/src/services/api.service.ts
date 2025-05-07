import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../utils/config';

export const tagTypes = [
  'AuthUser',
  'Company',
  'Document',
  'Laboratory',
  'Notification',
  'Prescription',
  'PrescriptionSubstance',
  'ProgrammingPlan',
  'RegionalPrescription',
  'Regions',
  'Sample',
  'SampleAnalysis',
  'SampleCount',
  'User'
];

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiEndpoint}/api`,
    prepareHeaders: (headers: Headers) => {
      const isImpersonateEnable = !!localStorage.getItem('administratorId');
      if (isImpersonateEnable) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          const impersonateId = JSON.parse(authUser).id;
          if (impersonateId) {
            const newHeaders = new Headers(headers);
            newHeaders.append('X-IMPERSONATE-ID', impersonateId);
            return newHeaders;
          } else {
            return headers;
          }
        }
      }
    },
    credentials: 'include'
  }),
  tagTypes,
  endpoints: () => ({})
});
