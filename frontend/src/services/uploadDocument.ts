import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';

export const uploadDocument = async (
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
