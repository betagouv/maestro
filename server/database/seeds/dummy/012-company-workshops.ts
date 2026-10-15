import { CompanyWorkshops } from '../../../repositories/companyWorkshopRepository';
import { AVIVOL, CHARAL } from './001-companies';

export const seed = async () => {
  await CompanyWorkshops().insert([
    {
      id: 'aaaaaaaa-0000-4000-8000-000000000001',
      siret: CHARAL.siret,
      ateIdentifiant: 'A01',
      ateLb: 'Abattage gros bovins',
      typeIdentEta: 'SIRET',
      etaId: CHARAL.siret,
      etaLb: CHARAL.name,
      adrLigne1: CHARAL.address,
      cpEtab: CHARAL.postalCode,
      communeEtab: CHARAL.city,
      cataLb: 'Abattoir de boucherie'
    },
    {
      id: 'aaaaaaaa-0000-4000-8000-000000000002',
      siret: CHARAL.siret,
      ateIdentifiant: 'A02',
      ateLb: 'Découpe et désossage',
      typeIdentEta: 'SIRET',
      etaId: CHARAL.siret,
      etaLb: CHARAL.name,
      adrLigne1: CHARAL.address,
      cpEtab: CHARAL.postalCode,
      communeEtab: CHARAL.city,
      cataLb: 'Atelier de découpe'
    },
    {
      id: 'aaaaaaaa-0000-4000-8000-000000000003',
      siret: AVIVOL.siret,
      ateIdentifiant: 'V01',
      ateLb: 'Abattage volailles',
      typeIdentEta: 'SIRET',
      etaId: AVIVOL.siret,
      etaLb: AVIVOL.name,
      adrLigne1: AVIVOL.address,
      cpEtab: AVIVOL.postalCode,
      communeEtab: AVIVOL.city,
      cataLb: 'Abattoir de volailles'
    }
  ]);
};
