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
    errorMap: () => ({
      message: "Veuillez renseigner l'entité"
    })
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
      companySearchResult.siege.libelle_commune
    ]
      .filter(isDefined)
      .join(' '),
    postalCode: companySearchResult.siege.code_postal,
    city: companySearchResult.siege.libelle_commune,
    nafCode: companySearchResult.activite_principale
  });

export const companyToSearchResult = (company: Company) =>
  CompanySearchResult.parse({
    siren: company.siret.slice(0, 9),
    nom_complet: company.name,
    nom_raison_sociale: company.tradeName,
    sigle: company.tradeName,
    siege: {
      activite_principale: company.nafCode,
      adresse: company.address ?? '',
      code_postal: company.postalCode ?? '',
      commune: company.city ?? '',
      departement: '',
      libelle_commune: company.city ?? '',
      libelle_voie: '',
      numero_voie: '',
      region: '',
      siret: company.siret,
      type_voie: ''
    },
    activite_principale: company.nafCode
  });
