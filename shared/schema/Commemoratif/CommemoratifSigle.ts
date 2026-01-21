import { z } from 'zod';

interface SachaCommemoratifValue {
  cle: string;
  sigle: CommemoratifValueSigle;
  libelle: string;
  statut: string;
}

export interface SachaCommemoratif {
  cle: string;
  sigle: CommemoratifSigle;
  libelle: string;
  statut: string;
  typeDonnee: string | null;
  unite: string | null;
  values: SachaCommemoratifValue[];
}

export const CommemoratifSigle = z.string().brand('CommemoratifSigle');
export type CommemoratifSigle = z.infer<typeof CommemoratifSigle>;

export const CommemoratifValueSigle = z
  .string()
  .brand('CommemoratifValueSigle');
export type CommemoratifValueSigle = z.infer<typeof CommemoratifValueSigle>;
