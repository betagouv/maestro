import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  type SSD2Id,
  SSD2Ids
} from 'maestro-shared/referential/Residue/SSD2Id';
import { CompanyFixture } from 'maestro-shared/test/companyFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  PPVValidatedProgrammingPlanFixture,
  PPVValidatedSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  genSampleItem
} from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { beforeAll, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { SampleItems } from '../../repositories/sampleItemRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { RaiLabError } from './sachaErrors';
import { processSachaRAI } from './sachaRAI';
import { NumeroEtiquette, referencesFromEtiquette } from './sachaReferences';
import type { SachaResultats } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

const decodeValidRai = (): SachaResultats => {
  const file = path.join(import.meta.dirname, './example-rai-daoa-valid.xml');
  const json = validateAndDecodeSachaXml(readFileSync(file).toString());
  if (!json.Resultats) {
    throw new Error('Le fichier de test ne contient pas de Resultats');
  }
  return json.Resultats;
};

const etiquetteFromRai = (rai: SachaResultats): NumeroEtiquette =>
  NumeroEtiquette.parse(
    rai.DialogueResultatType.DialogueEchantillonCommemoratifType?.[0]
      ?.DialogueEchantillonComplet?.NumeroEtiquette
  );

const analyteLabels = (rai: SachaResultats): string[] => {
  const labels = new Set<string>();
  for (const planAnalyse of rai.DialogueResultatType.DialoguePlanAnalyseType ??
    []) {
    for (const analyse of planAnalyse.DialogueAnalyseType ?? []) {
      labels.add(analyse.DialogueAnalyse.SigleAnalyte);
    }
  }
  return [...labels];
};

const seedResidueMappings = async (
  laboratoryId: string,
  labels: string[],
  ssd2Id: SSD2Id
): Promise<void> => {
  await kysely
    .insertInto('laboratoryResidueMappings')
    .values(labels.map((label) => ({ laboratoryId, label, ssd2Id })))
    .onConflict((oc) =>
      oc.columns(['laboratoryId', 'label']).doUpdateSet({ ssd2Id })
    )
    .execute();
};

describe('processSachaRAI', () => {
  const rai = decodeValidRai();
  const { reference, itemNumber } = referencesFromEtiquette(
    etiquetteFromRai(rai)
  );
  const sampleId = 'aaaaaaaa-bbbb-cccc-dddd-000000000099';
  const ssd2Id = SSD2Ids[0] as SSD2Id;

  beforeAll(async () => {
    const sample = genCreatedPartialSample({
      id: sampleId,
      sampler: Sampler1Fixture,
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      programmingSubPlanId: PPVValidatedSubPlanId,
      context: 'Surveillance',
      company: CompanyFixture,
      step: 'Sent',
      status: 'Sent',
      region: '44',
      department: '08',
      reference
    });
    await sampleRepository.insert(sample);

    await SampleItems().insert([
      genSampleItem({
        sampleId,
        itemNumber,
        copyNumber: 1,
        recipientKind: 'Laboratory',
        laboratoryId: LaboratoryFixture.id,
        substanceKind: 'Any'
      })
    ]);

    await seedResidueMappings(LaboratoryFixture.id, analyteLabels(rai), ssd2Id);
  });

  test('persiste l’analyse, les résidus et la date de réception', async () => {
    const result = await processSachaRAI(rai);

    expect(result).toEqual({
      laboratoryId: LaboratoryFixture.id,
      department: '08'
    });

    const analysis = await kysely
      .selectFrom('analysis')
      .selectAll()
      .where('sampleId', '=', sampleId)
      .executeTakeFirstOrThrow();

    expect(analysis).toMatchObject({
      status: 'Completed',
      compliance: true,
      itemNumber,
      copyNumber: 1
    });

    const residues = await kysely
      .selectFrom('analysisResidues')
      .selectAll()
      .where('analysisId', '=', analysis.id)
      .orderBy('residueNumber')
      .execute();

    expect(residues).toHaveLength(64);
    expect(residues[0]).toMatchObject({
      residueNumber: 1,
      reference: ssd2Id,
      resultKind: 'ND',
      result: null,
      analysisMethod: 'Multi',
      analysisKind: 'SCREENING',
      compliance: 'Compliant',
      accredited: true,
      ld: 0.001,
      lq: 0.002,
      preciseMethod: 'ANSES PBM Pest LSA-INS-0165',
      analysisDate: '2026-06-23'
    });
    // 8e analyte du fichier (MTHXCL) : non accrédité.
    expect(residues[7].accredited).toBe(false);

    const sampleItem = await kysely
      .selectFrom('sampleItems')
      .select('receiptDate')
      .where('sampleId', '=', sampleId)
      .where('itemNumber', '=', itemNumber)
      .where('copyNumber', '=', 1)
      .executeTakeFirstOrThrow();

    expect(sampleItem.receiptDate).toBe('2026-05-12');
  });

  test('lève une RaiLabError quand l’échantillon est introuvable', async () => {
    const unknownEtiquette = NumeroEtiquette.parse('022026440008882026113002');
    const orphanRai: SachaResultats = structuredClone(rai);
    orphanRai.DialogueResultatType.DialogueEchantillonCommemoratifType![0]
      .DialogueEchantillonComplet!.NumeroEtiquette = unknownEtiquette;

    await expect(processSachaRAI(orphanRai)).rejects.toThrow(RaiLabError);
    await expect(processSachaRAI(orphanRai)).rejects.toThrow(
      /Échantillon introuvable/
    );
  });
});
