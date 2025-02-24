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
    credentials: 'include'
  }),
  tagTypes,
  endpoints: () => ({})
});
