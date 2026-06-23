import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  DocumentChecked,
  ResourceDocumentToCreate
} from 'maestro-shared/schema/Document/Document';
import type { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const uploadDocument = async (
  fetchWithBQ: any,
  file: File,
  kind: DocumentKind
): Promise<{ documentId: string } | { error: FetchBaseQueryError }> => {
  const signedUrlResult = await fetchWithBQ({
    url: 'documents/upload-signed-url',
    method: 'POST',
    body: { filename: file.name, kind }
  });
  if (signedUrlResult.error) {
    return { error: signedUrlResult.error as FetchBaseQueryError };
  }

  const { url, documentId } = signedUrlResult.data as {
    url: string;
    documentId: string;
  };

  const uploadResult = await fetch(url, { method: 'PUT', body: file });
  if (!uploadResult.ok) {
    return {
      error: {
        status: uploadResult.status,
        data: await uploadResult.json()
      } as FetchBaseQueryError
    };
  }

  return { documentId };
};

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
    // biome-ignore lint: too complicated
    createResourceDocument: builder.mutation<
      DocumentChecked,
      Omit<ResourceDocumentToCreate, 'id' | 'filename'> & { file: File }
    >({
      queryFn: async ({ file, ...document }, _api, _extra, fetchWithBQ) => {
        const upload = await uploadDocument(fetchWithBQ, file, document.kind);
        if ('error' in upload) {
          return { error: upload.error };
        }
        const result = await fetchWithBQ({
          url: 'documents/resources',
          method: 'POST',
          body: { ...document, id: upload.documentId, filename: file.name }
        });
        return result.data
          ? { data: result.data as DocumentChecked }
          : { error: result.error as FetchBaseQueryError };
      },
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
    // biome-ignore lint: too complicated
    createSampleDocument: builder.mutation<
      DocumentChecked,
      { sampleId: string; file: File }
    >({
      queryFn: async ({ sampleId, file }, _api, _extra, fetchWithBQ) => {
        const upload = await uploadDocument(
          fetchWithBQ,
          file,
          'SampleDocument'
        );
        if ('error' in upload) {
          return { error: upload.error };
        }
        const result = await fetchWithBQ({
          url: `samples/${sampleId}/documents`,
          method: 'POST',
          body: {
            id: upload.documentId,
            filename: file.name,
            kind: 'SampleDocument'
          }
        });
        return result.data
          ? { data: result.data as DocumentChecked }
          : { error: result.error as FetchBaseQueryError };
      },
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
    ),
    // TODO(V2) : déplacer sous une route scopée par analyse.
    // biome-ignore lint: too complicated
    createDocument: builder.mutation<DocumentChecked, { file: File }>({
      queryFn: async ({ file }, _api, _extra, fetchWithBQ) => {
        const upload = await uploadDocument(
          fetchWithBQ,
          file,
          'AnalysisReportDocument'
        );
        if ('error' in upload) {
          return { error: upload.error };
        }
        const result = await fetchWithBQ({
          url: 'documents',
          method: 'POST',
          body: {
            id: upload.documentId,
            filename: file.name,
            kind: 'AnalysisReportDocument'
          }
        });
        return result.data
          ? { data: result.data as DocumentChecked }
          : { error: result.error as FetchBaseQueryError };
      },
      invalidatesTags: () => [{ type: 'Document', id: 'LIST' }]
    })
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
  useDeleteSampleDocumentMutation,
  useCreateDocumentMutation
} = documentApi;
