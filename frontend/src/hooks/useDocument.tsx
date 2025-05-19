import { useContext } from 'react';
import { ApiClientContext } from '../services/apiClient';

export const useDocument = () => {
  const apiClient = useContext(ApiClientContext);

  const [getDocumentUrl] = apiClient.useLazyGetDocumentDownloadSignedUrlQuery();

  const openDocument = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

  return { openDocument };
};
