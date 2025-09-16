import { useEffect, useState } from 'react';

interface ToastProps {
  delay?: number;
  children: React.ReactNode;
  onClose?: () => void;
}

const AutoClose = ({ delay, children, onClose }: ToastProps) => {
  const [close, setClose] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setClose(true);
      onClose?.();
    }, delay || 2000);

    return () => clearTimeout(timeoutId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return close ? <></> : <>{children}</>;
};

export default AutoClose;
