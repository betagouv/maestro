import { XMLParser } from 'fast-xml-parser';
import SachaReferentialError from 'maestro-shared/errors/sachaReferentialError';
import type { SachaReferentialImport } from 'maestro-shared/schema/SachaContext/SachaContext';
import {
  type DonneesStandardisees,
  updateSachaCommemoratifs
} from './sachaCommemoratifsService';
import {
  type ReferentielPrescripteur,
  updateSachaContexts
} from './sachaContextsService';

const ArrayTags = [
  'ReferenceCommemoratifType',
  'ReferenceCommemoratifsValeurs',
  'ReferenceContextesType',
  'ReferenceCommemoratifsInterventionContexte',
  'ReferenceCommemoratifsEchantillonContexte'
];

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  isArray: (name) => ArrayTags.includes(name)
});

export const importSachaReferential = async (
  xmlContent: string
): Promise<SachaReferentialImport> => {
  const parsed: {
    DonneesStandardisees?: DonneesStandardisees;
    ReferentielPrescripteur?: ReferentielPrescripteur;
  } = parser.parse(xmlContent);

  if (parsed.DonneesStandardisees) {
    return {
      kind: 'DS01',
      fileName: await updateSachaCommemoratifs(parsed.DonneesStandardisees)
    };
  }
  if (parsed.ReferentielPrescripteur) {
    return {
      kind: 'RP01',
      fileName: await updateSachaContexts(parsed.ReferentielPrescripteur)
    };
  }
  throw new SachaReferentialError(
    'Ce fichier n’est ni un référentiel des données standardisées (DS01) ni un référentiel prescripteur (RP01).'
  );
};
