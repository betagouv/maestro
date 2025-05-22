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
  prescriptionApi,
  useFindPrescriptionsQuery,
  useGetPrescriptionSubstancesQuery
} from './prescription.service';
import { useGetProgrammingPlanQuery } from './programming-plan.service';
import { useFindRegionalPrescriptionsQuery } from './regionalPrescription.service';
import {
  useCreateOrUpdateSampleMutation,
  useUpdateSampleMutation
} from './sample.service';

export type ApiClient = typeof apiClient;
export const apiClient = {
  useCreateDocumentMutation,
  useCreateOrUpdateSampleMutation,
  useDeleteDocumentMutation,
  useFindPrescriptionsQuery,
  useFindRegionalPrescriptionsQuery,
  useFindLaboratoriesQuery,
  useGetDocumentQuery,
  useGetLaboratoryQuery,
  useGetSampleAnalysisQuery: analysisApi.useGetSampleAnalysisQuery,
  useLazyGetDocumentDownloadSignedUrlQuery,
  useLazyGetPrescriptionSubstancesQuery:
    prescriptionApi.useLazyGetPrescriptionSubstancesQuery,
  useUpdateAnalysisMutation,
  useUpdateSampleMutation,
  useGetPrescriptionSubstancesQuery,
  useGetProgrammingPlanQuery
};

export const ApiClientContext = createContext<ApiClient>(undefined as never);
