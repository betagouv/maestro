import { useEffect } from 'react';

declare global {
  interface Window {
    _mtm?: Array<{ [key: string]: any }>;
    _paq?: Array<any>;
  }
}

const useMatomoTagManager = () => {
  useEffect(() => {
    const matomoUrl = import.meta.env.VITE_MATOMO_TAG_MANAGER_CONTAINER_URL;
    if (matomoUrl) {
      const _mtm = (window._mtm = window._mtm || []);
      _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });

      const d = document;
      const g = d.createElement('script');
      const s = d.getElementsByTagName('script')[0];

      g.async = true;
      g.src = matomoUrl;
      if (s.parentNode) {
        s.parentNode.insertBefore(g, s);
      }
    }
  }, []);
};

export default useMatomoTagManager;
