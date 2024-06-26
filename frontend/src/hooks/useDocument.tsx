import { useLazyGetDocumentDownloadSignedUrlQuery } from 'src/services/document.service';

export const useDocument = () => {
  const [getDocumentUrl] = useLazyGetDocumentDownloadSignedUrlQuery();

  const openDocument = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

  return { openDocument };
};
