import { CompanyWorkshops } from '../../../repositories/companyWorkshopRepository';
import { AVIVOL, CHARAL } from './001-companies';

const charalWorkshop = (
  id: string,
  ateIdentifiant: string,
  cataLbs: string,
  cataLb: string
) => ({
  id,
  siret: CHARAL.siret,
  ateIdentifiant,
  ateLb: `DOSDSV-${ateIdentifiant}-${cataLb}`,
  typeIdentEta: 'ILU',
  etaId: '61169002',
  etaLb: CHARAL.name,
  ideLb: 'Numéro dossier DSV',
  adrLigne1: " 370 rue de l'agriculture",
  cpEtab: '61100',
  communeEtab: 'FLERS',
  cataLbs,
  cataLb
});

export const seed = async () => {
  await CompanyWorkshops().insert([
    charalWorkshop(
      'aaaaaaaa-0000-4000-8000-000000000001',
      'SNACKS',
      'C_F_VIANDE',
      'Fabrication de Produits carnés'
    ),
    charalWorkshop(
      'aaaaaaaa-0000-4000-8000-000000000002',
      'PAC-BOULETTES',
      'C_P_VBOUCH',
      'Production de viandes de boucherie'
    ),
    charalWorkshop(
      'aaaaaaaa-0000-4000-8000-000000000003',
      'VIANDES CUITES',
      'C_F_VIANDE',
      'Fabrication de Produits carnés'
    ),
    charalWorkshop(
      'aaaaaaaa-0000-4000-8000-000000000004',
      'STEAKS HACHÉS',
      'C_P_VBOUCH',
      'Production de viandes de boucherie'
    ),
    charalWorkshop(
      'aaaaaaaa-0000-4000-8000-000000000005',
      'DECOUPE-DESOSSAGE',
      'C_AV_VBDC',
      'Viande de boucherie - Aval - Découpage de viandes de boucherie'
    ),
    charalWorkshop(
      'aaaaaaaa-0000-4000-8000-000000000006',
      'ENTREPÔT STOCKAGE',
      'A_ENT_DAOA',
      'Entreposage distribution de denrées alimentaires (grossistes,GMS)'
    ),
    {
      id: 'aaaaaaaa-0000-4000-8000-000000000011',
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
