import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  Document,
  DocumentToCreate,
  DocumentUpdate
} from 'maestro-shared/schema/Document/Document';
import { api } from 'src/services/api.service';

const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocument: builder.query<Document, string>({
      query: (documentId) => `documents/${documentId}`,
      transformResponse: (response: any) => Document.parse(response),
      providesTags: (result, _error, documentId) =>
        result ? [{ type: 'Document', id: documentId }] : []
    }),
    createDocument: builder.mutation<
      Document,
      Omit<DocumentToCreate, 'id' | 'filename'> & { file: File }
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
          ? { data: result.data as Document }
          : { error: result.error as FetchBaseQueryError };
      },
      invalidatesTags: () => [{ type: 'Document', id: 'LIST' }]
    }),
    updateDocument: builder.mutation<
      Document,
      DocumentUpdate & { documentId: string }
    >({
      query: ({ documentId, ...document }) => ({
        url: `documents/${documentId}`,
        method: 'PUT',
        body: document
      }),
      transformResponse: (response: any) => Document.parse(response),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: 'Document', documentId }
      ]
    }),
    findResources: builder.query<Document[], void>({
      query: () => 'documents/resources',
      transformResponse: (response: any[]) =>
        response.map((_) => Document.parse(_)),
      providesTags: (result) => [
        { type: 'Document', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Document' as const,
          id
        }))
      ]
    }),
    getDocumentDownloadSignedUrl: builder.query<string, string>({
      query: (documentId) => `documents/${documentId}/download-signed-url`,
      transformResponse: (response: any) => response.url
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `documents/${documentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, documentId) => [
        { type: 'Document', id: 'LIST' },
        { type: 'Document', id: documentId }
      ]
    })
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
