import { z } from 'zod';
import { isDefined } from '../../utils/utils';
import { CompanySearchResult } from './CompanySearchResult';
export const Company = z.object(
  {
    siret: z.string(),
    name: z.string(),
    tradeName: z.string().nullish(),
    address: z.string().nullish(),
    postalCode: z.string().nullish(),
    city: z.string().nullish(),
    nafCode: z.string().nullish()
  },
  {
    error: () => "Veuillez renseigner l'entité"
  }
);

export type Company = z.infer<typeof Company>;

export const companyFromSearchResult = (
  companySearchResult: CompanySearchResult
) =>
  Company.parse({
    siret: companySearchResult.siege.siret,
    name: companySearchResult.nom_complet,
    tradeName: companySearchResult.sigle,
    address: [
      companySearchResult.siege.numero_voie,
      companySearchResult.siege.type_voie,
      companySearchResult.siege.libelle_voie
    ]
      .filter(isDefined)
      .join(' '),
    postalCode: companySearchResult.siege.code_postal,
    city: companySearchResult.siege.libelle_commune,
    nafCode: companySearchResult.activite_principale
  });
