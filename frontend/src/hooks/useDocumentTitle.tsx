import { Brand } from 'maestro-shared/constants';
import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${Brand} - ${title}` : Brand;
  });
}
