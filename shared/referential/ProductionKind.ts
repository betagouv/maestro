import { z } from 'zod';

export const ProductionKind = z.enum(
  ['PROD_1', 'PROD_2', 'PROD_3', 'PROD_4', 'PD07A', 'Z0216', 'PD09A'],
  {
    error: () => 'Veuillez renseigner le type de production.'
  }
);

export type ProductionKind = z.infer<typeof ProductionKind>;

export const ProductionKindLabels: Record<ProductionKind, string> = {
  PROD_1: 'Allaitant',
  PROD_2: 'Laitier',
  PROD_3: 'Inconnu',
  PROD_4: 'Boucherie',
  PD07A: 'Production biologique',
  Z0216: 'Autre méthode de production',
  PD09A: 'Production non biologique'
};
