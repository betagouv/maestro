import { ApiClient } from '../services/apiClient';

export const useDocument = (apiClient: Pick<ApiClient, 'useLazyGetDocumentDownloadSignedUrlQuery'>) => {
  const [getDocumentUrl] = apiClient.useLazyGetDocumentDownloadSignedUrlQuery();

  const openDocument = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

  return { openDocument };
};
