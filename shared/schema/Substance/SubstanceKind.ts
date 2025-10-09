import { z } from 'zod';

export const SubstanceKind = z.enum(['Any', 'Mono', 'Multi', 'Copper']);

export const SubstanceKindLabels: Record<SubstanceKind, string> = {
  Any: 'Toutes les analyses',
  Mono: 'Analyse mono-résidu',
  Multi: 'Analyse multi-résidus',
  Copper: 'Analyse des cuivres'
};

export type SubstanceKind = z.infer<typeof SubstanceKind>;

export const SubstanceKindSort = (a: SubstanceKind, b: SubstanceKind) => {
  if (a === b) return 0;
  if (a === 'Any') return -1;
  if (b === 'Any') return 1;
  if (a === 'Mono') return -1;
  if (b === 'Mono') return 1;
  if (a === 'Multi') return -1;
  if (b === 'Multi') return 1;
  return a.localeCompare(b);
};
