import { useContext } from 'react';
import { ApiClientContext } from '../services/apiClient';

export const useDocument = () => {
  const apiClient = useContext(ApiClientContext);

  const [getDocumentUrl] = apiClient.useLazyGetDocumentDownloadSignedUrlQuery();

  const openDocument = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

  const downloadDocument = async (documentId: string, filename: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
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
