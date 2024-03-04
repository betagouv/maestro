import { useEffect } from 'react';
import { Brand } from 'shared/constants';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${Brand} - ${title}` : Brand;
  });
}
