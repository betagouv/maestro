import { z } from 'zod';

export const CompanyWorkshop = z.object(
  {
    id: z.guid(),
    siret: z.string(),
    ateIdentifiant: z.string(),
    ateLb: z.string(),
    typeIdentEta: z.string().nullish(),
    etaId: z.string().nullish(),
    etaLb: z.string().nullish(),
    ideLb: z.string().nullish(),
    adrLigne1: z.string().nullish(),
    cpEtab: z.string().nullish(),
    communeEtab: z.string().nullish(),
    cataLbs: z.string().nullish(),
    cataLb: z.string().nullish()
  },
  {
    error: () => "Veuillez renseigner l'atelier"
  }
);

export type CompanyWorkshop = z.infer<typeof CompanyWorkshop>;

export const companyWorkshopLabel = (workshop: CompanyWorkshop): string =>
  workshop.ateLb;
