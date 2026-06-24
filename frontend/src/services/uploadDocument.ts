import type {
  FetchBaseQueryError,
  MutationDefinition
} from '@reduxjs/toolkit/query';
import type { MaestroRoutes, routes } from 'maestro-shared/routes/routes';
import type {
  OrEmpty,
  RouteParams,
  RouteResponse
} from 'maestro-shared/routes/routes.infer';
import { generatePath } from 'react-router';

const uploadDocument = async (
  fetchWithBQ: any,
  file: File
): Promise<{ documentId: string } | { error: FetchBaseQueryError }> => {
  const signedUrlResult = await fetchWithBQ({
    url: 'documents/upload-signed-url',
    method: 'POST',
    body: { filename: file.name }
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
  url: string,
  extraBody: Record<string, unknown>
): Promise<{ data: T } | { error: FetchBaseQueryError }> => {
  const upload = await uploadDocument(fetchWithBQ, file);
  if ('error' in upload) {
    return { error: upload.error };
  }

  const result = await fetchWithBQ({
    url,
    method: 'POST',
    body: { ...extraBody, id: upload.documentId, filename: file.name }
  });

  return result.error
    ? { error: result.error as FetchBaseQueryError }
    : { data: result.data as T };
};

type PostRoute = {
  [P in MaestroRoutes]: 'post' extends keyof (typeof routes)[P] ? P : never;
}[MaestroRoutes];

type DocumentUploadConfig<Response, Arg> = {
  invalidatesTags?:
    | unknown[]
    | ((result: Response | undefined, error: unknown, arg: Arg) => unknown[]);
};

export const buildDocumentUploadMutation = <
  P extends PostRoute,
  Arg extends OrEmpty<RouteParams<P>> & { file: File } = OrEmpty<
    RouteParams<P>
  > & { file: File }
>(
  builder: any,
  path: P,
  config: DocumentUploadConfig<RouteResponse<P, 'post'>, Arg> = {}
): MutationDefinition<Arg, any, string, RouteResponse<P, 'post'>> =>
  builder.mutation({
    queryFn: (arg: Arg, _api: unknown, _extra: unknown, fetchWithBQ: any) => {
      const { file, ...rest } = arg as Arg & { file: File } & Record<
          string,
          unknown
        >;
      const paramKeys = new Set(
        Array.from(path.matchAll(/:([^/]+)/g), (m) => m[1])
      );
      const extraBody = Object.fromEntries(
        Object.entries(rest).filter(([k]) => !paramKeys.has(k))
      );
      return uploadAndCreateDocument<RouteResponse<P, 'post'>>(
        fetchWithBQ,
        file,
        generatePath<string>(
          path,
          arg as unknown as Record<string, string | null | undefined>
        ),
        extraBody
      );
    },
    invalidatesTags: config.invalidatesTags
  });
