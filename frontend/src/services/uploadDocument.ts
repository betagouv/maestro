import type {
  FetchBaseQueryError,
  MutationDefinition
} from '@reduxjs/toolkit/query';
import type { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';

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

const uploadAndCreateDocument = async <T>(
  fetchWithBQ: any,
  file: File,
  kind: DocumentKind,
  url: string,
  extraBody: Record<string, unknown>
): Promise<{ data: T } | { error: FetchBaseQueryError }> => {
  const upload = await uploadDocument(fetchWithBQ, file, kind);
  if ('error' in upload) {
    return { error: upload.error };
  }

  const result = await fetchWithBQ({
    url,
    method: 'POST',
    body: { ...extraBody, id: upload.documentId, filename: file.name, kind }
  });

  return result.error
    ? { error: result.error as FetchBaseQueryError }
    : { data: result.data as T };
};

type DocumentUploadConfig<Response, Arg extends { file: File }> = {
  kind: DocumentKind | ((arg: Arg) => DocumentKind);
  url: (arg: Arg) => string;
  extraBody?: (arg: Arg) => Record<string, unknown>;
  invalidatesTags?:
    | unknown[]
    | ((result: Response | undefined, error: unknown, arg: Arg) => unknown[]);
};

export const buildDocumentUploadMutation = <
  Response,
  Arg extends { file: File }
>(
  builder: any,
  config: DocumentUploadConfig<Response, Arg>
): MutationDefinition<Arg, any, string, Response> =>
  builder.mutation({
    queryFn: (arg: Arg, _api: unknown, _extra: unknown, fetchWithBQ: any) =>
      uploadAndCreateDocument<Response>(
        fetchWithBQ,
        arg.file,
        typeof config.kind === 'function' ? config.kind(arg) : config.kind,
        config.url(arg),
        config.extraBody?.(arg) ?? {}
      ),
    invalidatesTags: config.invalidatesTags
  });
