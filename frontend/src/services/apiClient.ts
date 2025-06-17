import { createContext } from 'react';
import { analysisApi, useUpdateAnalysisMutation } from './analysis.service';
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentQuery,
  useLazyGetDocumentDownloadSignedUrlQuery
} from './document.service';
import {
  useFindLaboratoriesQuery,
  useGetLaboratoryQuery
} from './laboratory.service';
import {
  useFindPrescriptionsQuery,
  useGetPrescriptionSubstancesQuery,
  useLazyFindPrescriptionsQuery,
  useLazyGetPrescriptionSubstancesQuery
} from './prescription.service';
import { useGetProgrammingPlanQuery } from './programming-plan.service';
import { useFindRegionalPrescriptionsQuery } from './regionalPrescription.service';
import {
  useCreateOrUpdateSampleMutation,
  useLazyFindSamplesQuery,
  useLazyGetSampleQuery,
  useUpdateSampleMutation
} from './sample.service';
import { useFindUsersQuery } from './user.service';

export type ApiClient = typeof apiClient;
export const apiClient = {
  useCreateDocumentMutation,
  useCreateOrUpdateSampleMutation,
  useDeleteDocumentMutation,
  useFindPrescriptionsQuery,
  useFindRegionalPrescriptionsQuery,
  useFindLaboratoriesQuery,
  useFindUsersQuery,
  useGetDocumentQuery,
  useGetLaboratoryQuery,
  useGetSampleAnalysisQuery: analysisApi.useGetSampleAnalysisQuery,
  useLazyGetSampleAnalysisQuery: analysisApi.useLazyGetSampleAnalysisQuery,
  useLazyGetDocumentDownloadSignedUrlQuery,
  useLazyGetPrescriptionSubstancesQuery: useLazyGetPrescriptionSubstancesQuery,
  useUpdateAnalysisMutation,
  useUpdateSampleMutation,
  useGetPrescriptionSubstancesQuery,
  useGetProgrammingPlanQuery,
  useLazyFindPrescriptionsQuery,
  useLazyFindSamplesQuery,
  useLazyGetSampleQuery
};

export const ApiClientContext = createContext<ApiClient>(undefined as never);
