import { XMLParser } from 'fast-xml-parser';
import SachaReferentialError from 'maestro-shared/errors/sachaReferentialError';
import type { SachaReferentialImport } from 'maestro-shared/schema/SachaContext/SachaContext';
import z from 'zod';
import {
  DonneesStandardiseesXml,
  updateSachaCommemoratifs
} from './sachaCommemoratifsService';
import {
  ReferentielPrescripteurXml,
  updateSachaContexts
} from './sachaContextsService';
import { validateSachaXml } from './validateSachaXml';

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

const SachaReferentialXml = z.object({
  DonneesStandardisees: DonneesStandardiseesXml.optional(),
  ReferentielPrescripteur: ReferentielPrescripteurXml.optional()
});

export const importSachaReferential = async (
  xmlContent: string
): Promise<SachaReferentialImport> => {
  try {
    validateSachaXml(xmlContent);
  } catch (e) {
    throw new SachaReferentialError(
      `Fichier non conforme à la XSD Sacha : ${(e as Error).message}`
    );
  }

  const decoded = SachaReferentialXml.safeParse(parser.parse(xmlContent));
  if (!decoded.success) {
    throw new SachaReferentialError(
      `Fichier conforme à la XSD Sacha mais décodage impossible : ${z.prettifyError(decoded.error)}`
    );
  }

  const { DonneesStandardisees, ReferentielPrescripteur } = decoded.data;
  if (DonneesStandardisees) {
    return {
      kind: 'DS01',
      fileName: await updateSachaCommemoratifs(DonneesStandardisees)
    };
  }
  if (ReferentielPrescripteur) {
    return {
      kind: 'RP01',
      fileName: await updateSachaContexts(ReferentielPrescripteur)
    };
  }
  throw new SachaReferentialError(
    'Ce fichier n’est ni un référentiel des données standardisées (DS01) ni un référentiel prescripteur (RP01).'
  );
};
