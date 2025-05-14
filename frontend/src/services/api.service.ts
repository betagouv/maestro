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
      const isMascaradeEnable = !!localStorage.getItem('administratorId');
      if (isMascaradeEnable) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          const mascaradeId = JSON.parse(authUser).id;
          if (mascaradeId) {
            const newHeaders = new Headers(headers);
            newHeaders.append('X-MASCARADE-ID', mascaradeId);
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
