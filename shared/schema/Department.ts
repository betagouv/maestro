import { z } from 'zod';

export const Department = z.enum(
  ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
  {
    errorMap: () => ({ message: 'Veuillez renseigner le département.' }),
  }
);

export type Department = z.infer<typeof Department>;

export const DepartmentList: Department[] = [
  '08',
  '10',
  '51',
  '52',
  '54',
  '55',
  '57',
  '67',
  '68',
  '88',
];

export const DepartmentLabels: Record<Department, string> = {
  '08': '08 - Ardennes',
  '10': '10 - Aube',
  '51': '51 - Marne',
  '52': '52 - Haute-Marne',
  '54': '54 - Meurthe-et-Moselle',
  '55': '55 - Meuse',
  '57': '57 - Moselle',
  '67': '67 - Bas-Rhin',
  '68': '68 - Haut-Rhin',
  '88': '88 - Vosges',
};
