import { useEffect } from 'react';
import { Brand } from 'maestro-shared/constants';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${Brand} - ${title}` : Brand;
  });
}
