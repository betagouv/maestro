type LocalStorageKey =
  | 'prescriptionListDisplay'
  | 'sampleListDisplay'
  | 'documentListDisplay';

export type ListDisplay = 'table' | 'cards';

export const getStoredListDisplay = (key: LocalStorageKey): ListDisplay => {
  const stored = localStorage.getItem(key);
  if (stored === 'table' || stored === 'cards') return stored;
  return 'cards';
};

export const setStoredListDisplay = (
  key: LocalStorageKey,
  value: ListDisplay
): void => {
  localStorage.setItem(key, value);
};
