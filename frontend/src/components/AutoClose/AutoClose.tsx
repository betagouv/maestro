import { useEffect, useState } from 'react';

interface ToastProps {
  delay?: number;
  children: React.ReactNode;
}

const AutoClose = ({ delay, children }: ToastProps) => {
  const [close, setClose] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setClose(true);
    }, delay || 2000);

    return () => clearTimeout(timeoutId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return close ? <></> : <>{children}</>;
};

export default AutoClose;
