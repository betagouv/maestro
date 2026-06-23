import { useContext } from 'react';
import { ApiClientContext } from '../services/apiClient';

export type DocumentScope =
  | { type: 'resource' }
  | { type: 'sample'; sampleId: string };

export const useDocument = () => {
  const apiClient = useContext(ApiClientContext);

  const [getResourceUrl] =
    apiClient.useLazyGetResourceDocumentDownloadSignedUrlQuery();
  const [getSampleUrl] =
    apiClient.useLazyGetSampleDocumentDownloadSignedUrlQuery();

  const getUrl = async (documentId: string, scope: DocumentScope) => {
    const { url } =
      scope.type === 'sample'
        ? await getSampleUrl({
            sampleId: scope.sampleId,
            documentId
          }).unwrap()
        : await getResourceUrl({ documentId }).unwrap();
    return url;
  };

  const openDocument = async (documentId: string, scope: DocumentScope) => {
    window.open(await getUrl(documentId, scope));
  };

  const downloadDocument = async (
    documentId: string,
    filename: string,
    scope: DocumentScope
  ) => {
    const url = await getUrl(documentId, scope);
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

  return { openDocument, downloadDocument };
};
