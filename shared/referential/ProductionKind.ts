import { z } from 'zod';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';

export const ProductionKind = z.enum(['PROD_1', 'PROD_2', 'PROD_3', 'PROD_4'], {
  error: () => 'Veuillez renseigner le type de production.'
});

export type ProductionKind = z.infer<typeof ProductionKind>;

export const ProductionKindLabels: Record<ProductionKind, string> = {
  PROD_1: 'Allaitant',
  PROD_2: 'Laitier',
  PROD_3: 'Inconnu',
  PROD_4: 'Boucherie'
};

export const ProductionKindsByProgrammingPlanKind = {
  [ProgrammingPlanKind.enum.DAOA_SLAUGHTER]: [
    'PROD_1',
    'PROD_2',
    'PROD_4',
    'PROD_3'
  ]
} as const satisfies Partial<Record<ProgrammingPlanKind, ProductionKind[]>>;
