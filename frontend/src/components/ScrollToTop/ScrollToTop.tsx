import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const previousPath = useRef({ pathname, search });

  useEffect(() => {
    if (previousPath.current.pathname !== pathname) {
      window.scrollTo(0, 0);
    }
    previousPath.current = { pathname, search };
  }, [pathname, search]);

  return null;
}
