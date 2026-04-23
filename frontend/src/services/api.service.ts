import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthUserRefined } from 'maestro-shared/schema/User/AuthUser';
import config from '../utils/config';

export const tagTypes = [
  'AnalysisDai',
  'AnalysisReportDocuments',
  'AuthUser',
  'Company',
  'DashboardNotice',
  'Document',
  'Laboratory',
  'LaboratoryAnalyticalCompetence',
  'LocalPrescription',
  'Notification',
  'Prescription',
  'PrescriptionSubstance',
  'ProgrammingPlan',
  'SampleSpecificData',
  'SpecificDataField',
  'LocalPrescription',
  'Regions',
  'RootNotice',
  'SachaCommemoratif',
  'Sample',
  'SampleCount',
  'SampleItemAnalysis',
  'SampleSpecificData',
  'User'
] as const;

export type TagType = (typeof tagTypes)[number];

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiEndpoint}/api`,
    prepareHeaders: (headers: Headers) => {
      const isMascaradeEnable = !!localStorage.getItem('administratorId');
      if (isMascaradeEnable) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          const mascaradeUser = AuthUserRefined.safeParse(
            JSON.parse(authUser)
          ).data;
          if (mascaradeUser) {
            const mascaradeId = mascaradeUser.user.id;
            if (mascaradeId) {
              const newHeaders = new Headers(headers);
              newHeaders.append('X-MASCARADE-ID', mascaradeId);
              return newHeaders;
            } else {
              return headers;
            }
          }
        }
      }
    },
    credentials: 'include'
  }),
  tagTypes,
  endpoints: () => ({})
});
