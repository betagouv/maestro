import { z } from 'zod/v4';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';

export const ProductionKind = z.enum(['PROD_1', 'PROD_2', 'PROD_3', 'PROD_4'], {
  error: () => 'Veuillez renseigner le type de production.'
});

export type ProductionKind = z.infer<typeof ProductionKind>;

export const ProductionKindLabels: Record<ProductionKind, string> = {
  PROD_1: 'Allaitant',
  PROD_2: 'Laitier',
  PROD_3: 'Inconnu (BV, OV ou CP)',
  PROD_4: 'Boucherie (PC ou EQ)'
};

export const ProductionKindsByProgrammingPlanKind: Partial<
  Record<ProgrammingPlanKind, ProductionKind[]>
> = {
  [ProgrammingPlanKind.enum.PFAS_MEAT]: [
    'PROD_1',
    'PROD_2',
    'PROD_3',
    'PROD_4'
  ],
  [ProgrammingPlanKind.enum.DAOA_SLAUGHTER]: ['PROD_1', 'PROD_2', 'PROD_3']
};
