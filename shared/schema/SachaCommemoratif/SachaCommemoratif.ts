import { z } from 'zod';

export const CommemoratifSigle = z.string().brand('CommemoratifSigle');
export type CommemoratifSigle = z.infer<typeof CommemoratifSigle>;

export const CommemoratifValueSigle = z
  .string()
  .brand('CommemoratifValueSigle');
export type CommemoratifValueSigle = z.infer<typeof CommemoratifValueSigle>;

export const SachaCommemoratifValue = z.object({
  cle: z.string(),
  sigle: CommemoratifValueSigle,
  libelle: z.string(),
  statut: z.string()
});
export type SachaCommemoratifValue = z.infer<typeof SachaCommemoratifValue>;

export const SachaCommemoratif = z.object({
  cle: z.string(),
  sigle: CommemoratifSigle,
  libelle: z.string(),
  statut: z.string(),
  typeDonnee: z.string().nullable(),
  unite: z.string().nullable(),
  values: z.array(SachaCommemoratifValue)
});
export type SachaCommemoratif = z.infer<typeof SachaCommemoratif>;
