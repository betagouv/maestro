import  { useGetDocumentQuery, useLazyGetDocumentDownloadSignedUrlQuery } from './document.service';
import {  useGetLaboratoryQuery } from './laboratory.service';
import { useUpdateSampleMutation } from './sample.service';
import { useGetSampleAnalysisQuery, useUpdateAnalysisMutation } from './analysis.service';

export type ApiClient = typeof apiClient
export const apiClient = {
  useGetDocumentQuery,
  useLazyGetDocumentDownloadSignedUrlQuery,
  useGetLaboratoryQuery,
  useUpdateSampleMutation,
  useUpdateAnalysisMutation,
  useGetSampleAnalysisQuery,
}
