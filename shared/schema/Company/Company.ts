import { z } from 'zod';
import { isDefined } from '../../utils/utils';
import { CompanySearchResult } from './CompanySearchResult';
export const Company = z.object(
  {
    siret: z.string(),
    name: z.string(),
    tradeName: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    nafCode: z.string().optional().nullable(),
  },
  {
    errorMap: () => ({
      message: "Veuillez renseigner l'entiré",
    }),
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
      companySearchResult.siege.libelle_commune,
    ]
      .filter(isDefined)
      .join(' '),
    postalCode: companySearchResult.siege.code_postal,
    city: companySearchResult.siege.libelle_commune,
    nafCode: companySearchResult.activite_principale,
  });
