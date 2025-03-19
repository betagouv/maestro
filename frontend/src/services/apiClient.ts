import { createContext } from 'react';
import {
  useGetSampleAnalysisQuery,
  useUpdateAnalysisMutation
} from './analysis.service';
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentQuery,
  useLazyGetDocumentDownloadSignedUrlQuery
} from './document.service';
import { useGetLaboratoryQuery } from './laboratory.service';
import { useFindPrescriptionsQuery } from './prescription.service';
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
  useGetSampleAnalysisQuery: typeof useGetSampleAnalysisQuery;
  useLazyGetDocumentDownloadSignedUrlQuery: typeof useLazyGetDocumentDownloadSignedUrlQuery;
  useUpdateAnalysisMutation: typeof useUpdateAnalysisMutation;
  useUpdateSampleMutation: typeof useUpdateSampleMutation;
} = {
  useCreateDocumentMutation,
  useCreateOrUpdateSampleMutation,
  useDeleteDocumentMutation,
  useFindPrescriptionsQuery,
  useFindRegionalPrescriptionsQuery,
  useGetDocumentQuery,
  useGetLaboratoryQuery,
  useGetSampleAnalysisQuery,
  useLazyGetDocumentDownloadSignedUrlQuery,
  useUpdateAnalysisMutation,
  useUpdateSampleMutation
};

export const ApiClientContext = createContext<ApiClient>(undefined as never);
