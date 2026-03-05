export const LocalStorageListKeys = [
  'prescriptionListDisplay',
  'sampleListDisplay',
  'documentListDisplay'
] as const;

export type LocalStorageKey = (typeof LocalStorageListKeys)[number];

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
