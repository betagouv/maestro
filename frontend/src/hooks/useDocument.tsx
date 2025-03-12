import { ApiClientContext } from '../services/apiClient';
import { useContext } from 'react';

export const useDocument = () => {
  const apiClient = useContext(ApiClientContext)

  const [getDocumentUrl] = apiClient.useLazyGetDocumentDownloadSignedUrlQuery();

  const openDocument = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

  return { openDocument };
};
