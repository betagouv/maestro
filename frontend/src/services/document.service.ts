import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  DocumentChecked,
  DocumentToCreateChecked
} from 'maestro-shared/schema/Document/Document';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocument: buildTypedQuery(builder, '/documents/:documentId', {
      providesTags: (result, _error, { documentId }) =>
        result ? [{ type: 'Document', id: documentId }] : []
    }),
    // biome-ignore lint: too complicated
    createDocument: builder.mutation<
      DocumentChecked,
      Omit<DocumentToCreateChecked, 'id' | 'filename'> & { file: File }
    >({
      queryFn: async (
        { file, ...document },
        _queryApi,
        _extraOptions,
        fetchWithBQ
      ) => {
        const signedUrlResult = await fetchWithBQ({
          url: 'documents/upload-signed-url',
          method: 'POST',
          body: { filename: file.name, kind: document.kind }
        });
        if (signedUrlResult.error) {
          return { error: signedUrlResult.error as FetchBaseQueryError };
        }

        const { url, documentId } = (await signedUrlResult.data) as {
          url: string;
          documentId: string;
        };

        const uploadResult = await fetch(url, {
          method: 'PUT',
          body: file
        });
        if (!uploadResult.ok) {
          return {
            error: {
              status: uploadResult.status,
              data: await uploadResult.json()
            } as FetchBaseQueryError
          };
        }

        const result = await fetchWithBQ({
          url: 'documents',
          method: 'POST',
          body: {
            ...document,
            id: documentId,
            filename: file.name
          }
        });
        return result.data
          ? { data: result.data as DocumentChecked }
          : { error: result.error as FetchBaseQueryError };
      },
      invalidatesTags: () => [{ type: 'Document', id: 'LIST' }]
    }),
    updateDocument: buildTypedMutation(
      builder,
      '/documents/:documentId',
      'put',
      {
        invalidatesTags: (_result, _error, { documentId }) => [
          { type: 'Document', id: documentId }
        ]
      }
    ),
    findResources: buildTypedQuery(builder, '/documents/resources', {
      providesTags: (result) => [
        { type: 'Document', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Document' as const,
          id
        }))
      ]
    }),
    getDocumentDownloadSignedUrl: buildTypedQuery(
      builder,
      '/documents/:documentId/download-signed-url'
    ),
    deleteDocument: buildTypedMutation(
      builder,
      '/documents/:documentId',
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
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useFindResourcesQuery,
  useDeleteDocumentMutation,
  useGetDocumentDownloadSignedUrlQuery,
  useLazyGetDocumentDownloadSignedUrlQuery,
  useUpdateDocumentMutation
} = documentApi;
