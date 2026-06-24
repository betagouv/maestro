import type {
  DocumentChecked,
  ResourceDocumentToCreate
} from 'maestro-shared/schema/Document/Document';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import { buildDocumentUploadMutation } from 'src/services/uploadDocument';

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
    getResourceDocumentDownloadSignedUrl: buildTypedQuery(
      builder,
      '/documents/resources/:documentId/download-signed-url'
    ),
    createResourceDocument: buildDocumentUploadMutation<
      DocumentChecked,
      Omit<ResourceDocumentToCreate, 'id' | 'filename'> & { file: File }
    >(builder, {
      kind: ({ kind }) => kind,
      url: () => 'documents/resources',
      extraBody: ({ file: _file, ...document }) => document,
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
    getSampleDocumentDownloadSignedUrl: buildTypedQuery(
      builder,
      '/samples/:sampleId/documents/:documentId/download-signed-url'
    ),
    createSampleDocument: buildDocumentUploadMutation<
      DocumentChecked,
      { sampleId: string; file: File }
    >(builder, {
      kind: 'SampleDocument',
      url: ({ sampleId }) => `samples/${sampleId}/documents`,
      invalidatesTags: () => [{ type: 'Document', id: 'LIST' }]
    }),
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
  useLazyGetResourceDocumentDownloadSignedUrlQuery,
  useCreateResourceDocumentMutation,
  useUpdateResourceDocumentMutation,
  useDeleteResourceDocumentMutation,
  useGetSampleDocumentQuery,
  useGetSampleDocumentDownloadSignedUrlQuery,
  useLazyGetSampleDocumentDownloadSignedUrlQuery,
  useCreateSampleDocumentMutation,
  useUpdateSampleDocumentMutation,
  useDeleteSampleDocumentMutation
} = documentApi;
