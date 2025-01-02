import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { withAuthHeader } from 'src/services/auth-headers';
import config from '../utils/config';

export const tagTypes = [
  'AuthUser',
  'Company',
  'Document',
  'Laboratory',
  'Prescription',
  'PrescriptionSubstance',
  'ProgrammingPlan',
  'RegionalPrescription',
  'Regions',
  'Sample',
  'SampleAnalysis',
  'SampleCount',
  'UserInfos'
];

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiEndpoint}/api`,
    prepareHeaders: withAuthHeader
  }),
  tagTypes,
  endpoints: () => ({})
});
