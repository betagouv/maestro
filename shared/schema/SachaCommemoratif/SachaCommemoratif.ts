import { z } from 'zod';

export const CommemoratifSigle = z.string().brand('CommemoratifSigle');
export type CommemoratifSigle = z.infer<typeof CommemoratifSigle>;

export const CommemoratifValueSigle = z
  .string()
  .brand('CommemoratifValueSigle');
export type CommemoratifValueSigle = z.infer<typeof CommemoratifValueSigle>;

export const SachaCommemoratifValue = z.object({
  sigle: CommemoratifValueSigle,
  libelle: z.string()
});

export const SachaCommemoratifTypeDonnee = z.enum([
  'text',
  'numeric',
  'date',
  'list'
]);

export type SachaCommemoratifTypeDonnee = z.infer<
  typeof SachaCommemoratifTypeDonnee
>;

export const SachaCommemoratif = z.object({
  sigle: CommemoratifSigle,
  libelle: z.string(),
  typeDonnee: SachaCommemoratifTypeDonnee,
  unite: z.string().nullable(),
  values: z.array(SachaCommemoratifValue)
});
export type SachaCommemoratif = z.infer<typeof SachaCommemoratif>;

export const SachaCommemoratifRecord = z.record(
  CommemoratifSigle,
  z.object({
    ...SachaCommemoratif.shape,
    values: z.record(CommemoratifValueSigle, SachaCommemoratifValue)
  })
);

export type SachaCommemoratifRecord = z.infer<typeof SachaCommemoratifRecord>;
