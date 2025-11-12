import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  onSave: (value: string) => void | Promise<void>;
  delay?: number;
}

export const useAutoSave = ({ onSave, delay = 500 }: UseAutoSaveOptions) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const triggerSave = (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSave(value);
    }, delay);
  };

  return { triggerSave };
};
