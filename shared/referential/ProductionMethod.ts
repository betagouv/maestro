import { z } from 'zod';

//TODO
export const ProductionMethod = z.enum(['PROD_1', 'PROD_2', 'PROD_3'], {
  error: () => 'Veuillez renseigner le type de production.'
});

export type ProductionMethod = z.infer<typeof ProductionMethod>;

export const ProductionMethodList = ProductionMethod.options;

export const ProductionMethodLabels: Record<ProductionMethod, string> = {
  PROD_1: 'Biologique',
  PROD_2: 'Standard',
  PROD_3: 'Autre signe de qualité'
};
