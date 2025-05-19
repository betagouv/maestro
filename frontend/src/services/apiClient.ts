import { createContext } from 'react';
import { analysisApi, useUpdateAnalysisMutation } from './analysis.service';
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentQuery,
  useLazyGetDocumentDownloadSignedUrlQuery
} from './document.service';
import { useGetLaboratoryQuery } from './laboratory.service';
import {
  useFindPrescriptionsQuery,
  useGetPrescriptionSubstancesQuery
} from './prescription.service';
import { useFindRegionalPrescriptionsQuery } from './regionalPrescription.service';
import {
  useCreateOrUpdateSampleMutation,
  useUpdateSampleMutation
} from './sample.service';

export type ApiClient = typeof apiClient;
export const apiClient: {
  useCreateDocumentMutation: typeof useCreateDocumentMutation;
  useCreateOrUpdateSampleMutation: typeof useCreateOrUpdateSampleMutation;
  useDeleteDocumentMutation: typeof useDeleteDocumentMutation;
  useFindPrescriptionsQuery: typeof useFindPrescriptionsQuery;
  useFindRegionalPrescriptionsQuery: typeof useFindRegionalPrescriptionsQuery;
  useGetDocumentQuery: typeof useGetDocumentQuery;
  useGetLaboratoryQuery: typeof useGetLaboratoryQuery;
  useGetSampleAnalysisQuery: (typeof analysisApi)['useGetSampleAnalysisQuery'];
  useLazyGetDocumentDownloadSignedUrlQuery: typeof useLazyGetDocumentDownloadSignedUrlQuery;
  useUpdateAnalysisMutation: typeof useUpdateAnalysisMutation;
  useUpdateSampleMutation: typeof useUpdateSampleMutation;
  useGetPrescriptionSubstancesQuery: typeof useGetPrescriptionSubstancesQuery;
} = {
  useCreateDocumentMutation,
  useCreateOrUpdateSampleMutation,
  useDeleteDocumentMutation,
  useFindPrescriptionsQuery,
  useFindRegionalPrescriptionsQuery,
  useGetDocumentQuery,
  useGetLaboratoryQuery,
  useGetSampleAnalysisQuery: analysisApi.useGetSampleAnalysisQuery,
  useLazyGetDocumentDownloadSignedUrlQuery,
  useUpdateAnalysisMutation,
  useUpdateSampleMutation,
  useGetPrescriptionSubstancesQuery
};

export const ApiClientContext = createContext<ApiClient>(undefined as never);
