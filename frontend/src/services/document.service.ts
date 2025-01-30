import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Document } from 'maestro-shared/schema/Document/Document';
import { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';
import { api } from 'src/services/api.service';

export const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocument: builder.query<Document, string>({
      query: (documentId) => `documents/${documentId}`,
      transformResponse: (response: any) => Document.parse(response),
      providesTags: (result, _error, documentId) =>
        result ? [{ type: 'Document', id: documentId }] : [],
    }),
    createDocument: builder.mutation<
      Document,
      { file: File; kind: DocumentKind }
    >({
      queryFn: async (
        { file, kind },
        _queryApi,
        _extraOptions,
        fetchWithBQ
      ) => {
        const signedUrlResult = await fetchWithBQ({
          url: 'documents/upload-signed-url',
          method: 'POST',
          body: { filename: file.name, kind },
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
          body: file,
        });
        if (!uploadResult.ok) {
          return {
            error: {
              status: uploadResult.status,
              data: await uploadResult.json(),
            } as FetchBaseQueryError,
          };
        }

        const result = await fetchWithBQ({
          url: 'documents',
          method: 'POST',
          body: {
            id: documentId,
            filename: file.name,
            kind,
          },
        });
        return result.data
          ? { data: result.data as Document }
          : { error: result.error as FetchBaseQueryError };
      },
      invalidatesTags: () => [{ type: 'Document', id: 'LIST' }],
    }),
    findResources: builder.query<Document[], void>({
      query: () => 'documents/resources',
      transformResponse: (response: any[]) =>
        response.map((_) => Document.parse(_)),
      providesTags: (result) => [
        { type: 'Document', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Document' as const,
          id,
        })),
      ],
    }),
    getDocumentDownloadSignedUrl: builder.query<string, string>({
      query: (documentId) => `documents/${documentId}/download-signed-url`,
      transformResponse: (response: any) => response.url,
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, documentId) => [
        { type: 'Document', id: 'LIST' },
        { type: 'Document', id: documentId },
      ],
    }),
  }),
});

export const {
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useFindResourcesQuery,
  useDeleteDocumentMutation,
  useLazyGetDocumentDownloadSignedUrlQuery,
} = documentApi;
