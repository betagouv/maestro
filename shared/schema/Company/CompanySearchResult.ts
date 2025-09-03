import { z } from 'zod';

export const CompanySearchResult = z.object({
  siren: z.string(),
  nom_complet: z.string(),
  nom_raison_sociale: z.string().nullish(),
  sigle: z.string().nullish(),
  siege: z.object({
    activite_principale: z.string(),
    adresse: z.string(),
    code_postal: z.string(),
    commune: z.string(),
    complement_adresse: z.string().nullish(),
    departement: z.string(),
    libelle_commune: z.string(),
    libelle_voie: z.string().nullish(),
    numero_voie: z.string().nullish(),
    region: z.string(),
    siret: z.string(),
    type_voie: z.string().nullish()
  }),
  activite_principale: z.string()
});

export type CompanySearchResult = z.infer<typeof CompanySearchResult>;
