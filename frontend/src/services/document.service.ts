import type { ResourceDocumentToCreate } from 'maestro-shared/schema/Document/Document';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import { buildDocumentUploadMutation } from 'src/services/uploadDocument';
import { getApiUrl } from 'src/utils/fetchUtils';

export type DocumentScope =
  | { type: 'resource' }
  | { type: 'sample'; sampleId: string };

export const getDocumentDownloadURL = (
  documentId: string,
  scope: DocumentScope
): string =>
  scope.type === 'sample'
    ? getApiUrl('/samples/:sampleId/documents/:documentId/download', {
        sampleId: scope.sampleId,
        documentId
      })
    : getApiUrl('/documents/resources/:documentId/download', {
        documentId
      });

const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findResources: buildTypedQuery(builder, '/documents/resources', {
      providesTags: (result) => [
        { type: 'Document', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({ type: 'Document' as const, id }))
      ]
    }),
    getResourceDocument: buildTypedQuery(
      builder,
      '/documents/resources/:documentId',
      {
        providesTags: (result, _error, { documentId }) =>
          result ? [{ type: 'Document', id: documentId }] : []
      }
    ),
    createResourceDocument: buildDocumentUploadMutation<
      '/documents/resources',
      Omit<ResourceDocumentToCreate, 'id' | 'filename'> & { file: File }
    >(builder, '/documents/resources', {
      invalidatesTags: () => [{ type: 'Document', id: 'LIST' }]
    }),
    updateResourceDocument: buildTypedMutation(
      builder,
      '/documents/resources/:documentId',
      'put',
      {
        invalidatesTags: (_result, _error, { documentId }) => [
          { type: 'Document', id: documentId }
        ]
      }
    ),
    deleteResourceDocument: buildTypedMutation(
      builder,
      '/documents/resources/:documentId',
      'delete',
      {
        invalidatesTags: (_result, _error, { documentId }) => [
          { type: 'Document', id: 'LIST' },
          { type: 'Document', id: documentId }
        ]
      }
    ),
    getSampleDocument: buildTypedQuery(
      builder,
      '/samples/:sampleId/documents/:documentId',
      {
        providesTags: (result, _error, { documentId }) =>
          result ? [{ type: 'Document', id: documentId }] : []
      }
    ),
    createSampleDocument: buildDocumentUploadMutation(
      builder,
      '/samples/:sampleId/documents',
      {
        invalidatesTags: () => [{ type: 'Document', id: 'LIST' }]
      }
    ),
    updateSampleDocument: buildTypedMutation(
      builder,
      '/samples/:sampleId/documents/:documentId',
      'put',
      {
        invalidatesTags: (_result, _error, { documentId }) => [
          { type: 'Document', id: documentId }
        ]
      }
    ),
    deleteSampleDocument: buildTypedMutation(
      builder,
      '/samples/:sampleId/documents/:documentId',
      'delete',
      {
        invalidatesTags: (_result, _error, { documentId }) => [
          { type: 'Document', id: 'LIST' },
          { type: 'Document', id: documentId }
        ]
      }
    )
  })
});

export const {
  useFindResourcesQuery,
  useGetResourceDocumentQuery,
  useCreateResourceDocumentMutation,
  useUpdateResourceDocumentMutation,
  useDeleteResourceDocumentMutation,
  useGetSampleDocumentQuery,
  useCreateSampleDocumentMutation,
  useUpdateSampleDocumentMutation,
  useDeleteSampleDocumentMutation
} = documentApi;
