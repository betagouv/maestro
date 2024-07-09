import { z } from 'zod';

export const ResidueKind = z.enum(['Simple', 'Complexe']);

export type ResidueKind = z.infer<typeof ResidueKind>;

export const ResidueKindList: ResidueKind[] = ResidueKind.options;

export const ResidueKindLabels: Record<ResidueKind, string> = {
  Simple: 'Simple',
  Complexe: 'Complexe',
};
