import { z } from 'zod';

export const CompanySearchResult = z.object({
  siren: z.string(),
  nom_complet: z.string(),
  nom_raison_sociale: z.string().optional().nullable(),
  sigle: z.string().optional().nullable(),
  siege: z.object({
    activite_principale: z.string(),
    adresse: z.string(),
    code_postal: z.string(),
    commune: z.string(),
    complement_adresse: z.string().optional().nullable(),
    departement: z.string(),
    libelle_commune: z.string(),
    libelle_voie: z.string().optional().nullable(),
    numero_voie: z.string().optional().nullable(),
    region: z.string(),
    siret: z.string(),
    type_voie: z.string().optional().nullable(),
  }),
  activite_principale: z.string(),
});

export type CompanySearchResult = z.infer<typeof CompanySearchResult>;
