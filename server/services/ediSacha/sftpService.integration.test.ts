import { Readable } from 'node:stream';
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
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import { kysely } from '../../repositories/kysely';
import { SampleItems } from '../../repositories/sampleItemRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { documentService } from '../documentService';
import { NumeroEtiquette, referencesFromEtiquette } from './sachaReferences';
import { readSachaExample } from './testUtils';

const { mockSendSachaFile } = vi.hoisted(() => ({
  mockSendSachaFile: vi.fn()
}));
vi.mock('./sachaSender', () => ({ sendSachaFile: mockSendSachaFile }));

const { processSachaContent, replayRai } = await import('./sftpService');

const LAB_SIGLE = 'LABTEST';
const SAMPLE_ID = 'aaaaaaaa-bbbb-cccc-dddd-000000000098';
const KNOWN_ETIQUETTE = '022026440009992026113002';
const UNKNOWN_ETIQUETTE = '022026440008882026113002';

const baseXml = readSachaExample('example-rai-daoa-valid.xml');

const validXml = baseXml.replace(
  '<Sigle>MDPPTST</Sigle>',
  '<Sigle>MDDSV08</Sigle>'
);

const asBuffer = (xml: string): Buffer => Buffer.from(xml);

const sachaConf = {
  versionReferenceStandardisees: 'v0',
  versionReferencePrescripteur: 'v0'
} as const;

const lastSentFile = () => {
  const call = mockSendSachaFile.mock.calls.at(-1);
  if (!call) throw new Error('sendSachaFile was not called');
  return { xmlFile: call[0], laboratory: call[2] };
};

describe('sftpService pipeline (decode, process, respond)', () => {
  const { reference, itemNumber } = referencesFromEtiquette(
    NumeroEtiquette.parse(KNOWN_ETIQUETTE)
  );

  beforeAll(async () => {
    await kysely
      .updateTable('laboratories')
      .set({
        sachaActivated: true,
        sachaSigle: LAB_SIGLE,
        sachaCommunicationMethod: 'EMAIL',
        sachaRecipientEmail: 'labo@test.fr'
      })
      .where('id', '=', LaboratoryFixture.id)
      .execute();

    await sampleRepository.insert(
      genCreatedPartialSample({
        id: SAMPLE_ID,
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
      })
    );
    await SampleItems().insert([
      genSampleItem({
        sampleId: SAMPLE_ID,
        itemNumber,
        copyNumber: 1,
        recipientKind: 'Laboratory',
        laboratoryId: LaboratoryFixture.id,
        substanceKind: 'Any'
      })
    ]);
  });

  beforeEach(() => {
    mockSendSachaFile.mockReset();
    mockSendSachaFile.mockResolvedValue('EMAIL');
  });

  const ADDRESSABLE_FILENAME = `RA01${LAB_SIGLE}DDSV08260101120000000.xml`;

  const run = (xml: string, fileName: string = ADDRESSABLE_FILENAME) =>
    processSachaContent(
      asBuffer(xml),
      '00000000-0000-0000-0000-0000000000ff',
      sachaConf,
      fileName
    );

  test('succès : PROCESSED + AN01 MessageAcquittement (non-régression)', async () => {
    const response = await run(validXml);

    expect(response.state).toBe('PROCESSED');
    expect(response.laboratoryId).toBe(LaboratoryFixture.id);
    expect(mockSendSachaFile).toHaveBeenCalledTimes(1);

    const { xmlFile } = lastSentFile();
    expect(xmlFile.fileType).toBe('AN01');
    expect(xmlFile.content).toContain('<MessageAcquittement>');
    expect(xmlFile.content).not.toContain('<MessageNonAcquittement>');

    const analysis = await kysely
      .selectFrom('analysis')
      .selectAll()
      .where('sampleId', '=', SAMPLE_ID)
      .executeTakeFirstOrThrow();
    expect(analysis.status).toBe('Completed');
    expect(response.analysisId).toBe(analysis.id);
  });

  test('faute labo (conclusion inconnue) : REJECTED + AN01 MessageNonAcquittement adressé au bon labo', async () => {
    const xml = validXml.replace(
      '<SigleConclusion>CONFORM</SigleConclusion>',
      '<SigleConclusion>INCONNU</SigleConclusion>'
    );

    const response = await run(xml);

    expect(response.state).toBe('REJECTED');
    expect(response.analysisId).toBeNull();
    expect(response.laboratoryId).toBe(LaboratoryFixture.id);
    expect(response.message).toMatch(
      /Conclusion d’échantillon inconnue|Conclusion d'échantillon inconnue/
    );
    expect(mockSendSachaFile).toHaveBeenCalledTimes(1);

    const { xmlFile, laboratory } = lastSentFile();
    expect(xmlFile.fileType).toBe('AN01');
    expect(xmlFile.content).toContain('<MessageNonAcquittement>');
    expect(xmlFile.content).not.toContain('<MessageAcquittement>');
    expect(xmlFile.content).toContain('INCONNU');
    // The recipient of the NACK is resolved from the incoming Emetteur.Sigle.
    expect(laboratory.id).toBe(LaboratoryFixture.id);
    expect(laboratory.sacha.sigle).toBe(LAB_SIGLE);
  });

  test('faute interne (analyte non mappé) : INTERNAL_ERROR, aucun AN01', async () => {
    const xml = validXml.replace(
      '<SigleAnalyte>ALD</SigleAnalyte>',
      '<SigleAnalyte>ZZZUNKNOWN</SigleAnalyte>'
    );

    const response = await run(xml);

    expect(response.state).toBe('INTERNAL_ERROR');
    expect(response.message).toContain('ZZZUNKNOWN');
    expect(mockSendSachaFile).not.toHaveBeenCalled();
  });

  test('échantillon introuvable : REJECTED adressé via l’enveloppe (indépendant de la résolution)', async () => {
    const xml = validXml.replace(KNOWN_ETIQUETTE, UNKNOWN_ETIQUETTE);

    const response = await run(xml);

    expect(response.state).toBe('REJECTED');
    expect(response.message).toMatch(/Échantillon introuvable/);
    expect(mockSendSachaFile).toHaveBeenCalledTimes(1);

    const { xmlFile, laboratory } = lastSentFile();
    expect(xmlFile.content).toContain('<MessageNonAcquittement>');
    expect(laboratory.sacha.sigle).toBe(LAB_SIGLE);
  });

  test('XSD invalide mais nom de fichier adressable : REJECTED (fichier invalide)', async () => {
    const xml = validXml.replace(
      '<ValeurResultatQuantitatif>0.001</ValeurResultatQuantitatif>',
      '<ValeurResultatQuantitatif>ABC</ValeurResultatQuantitatif>'
    );

    const response = await run(xml);

    expect(response.state).toBe('REJECTED');
    expect(response.message).toContain('fichier invalide');
    expect(mockSendSachaFile).toHaveBeenCalledTimes(1);

    const { xmlFile, laboratory } = lastSentFile();
    expect(xmlFile.content).toContain('<MessageNonAcquittement>');
    // Addressing is resolved from the file name, not from the invalid XML.
    expect(laboratory.sacha.sigle).toBe(LAB_SIGLE);
    expect(xmlFile.content).toContain(`RA01${LAB_SIGLE}DDSV08260101120000000`);
  });

  test('XSD invalide + nom de fichier hors convention : INTERNAL_ERROR, aucun AN01', async () => {
    const xml = validXml.replace(/<Emetteur>[\s\S]*?<\/Emetteur>/, '');

    const response = await run(xml, 'fichier-hors-convention.xml');

    expect(response.state).toBe('INTERNAL_ERROR');
    expect(response.message).toMatch(/non adressable/);
    expect(mockSendSachaFile).not.toHaveBeenCalled();
  });

  test('XSD valide mais sans Resultats (AN01) : INTERNAL_ERROR, aucun AN01', async () => {
    const xml = readSachaExample('example-an-1.xml');

    const response = await run(xml);

    expect(response.state).toBe('INTERNAL_ERROR');
    expect(response.message).toContain('XML conforme à la XSD');
    expect(mockSendSachaFile).not.toHaveBeenCalled();
  });

  test('échec d’envoi de l’AN01 après un ACK : INTERNAL_ERROR mais analyse persistée ; le replay idempotent aboutit à PROCESSED sans doublon', async () => {
    mockSendSachaFile.mockReset();
    mockSendSachaFile.mockRejectedValueOnce(new Error('SFTP indisponible'));
    mockSendSachaFile.mockResolvedValue('EMAIL');

    const first = await run(validXml);
    expect(first.state).toBe('INTERNAL_ERROR');
    expect(first.message).toContain('SFTP indisponible');

    const analysis = await kysely
      .selectFrom('analysis')
      .selectAll()
      .where('sampleId', '=', SAMPLE_ID)
      .executeTakeFirstOrThrow();
    expect(first.analysisId).toBe(analysis.id);
    const residuesBefore = await kysely
      .selectFrom('analysisResidues')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('analysisId', '=', analysis.id)
      .executeTakeFirstOrThrow();
    expect(Number(residuesBefore.count)).toBe(64);

    const second = await run(validXml);
    expect(second.state).toBe('PROCESSED');

    const analyses = await kysely
      .selectFrom('analysis')
      .selectAll()
      .where('sampleId', '=', SAMPLE_ID)
      .execute();
    expect(analyses).toHaveLength(1);
    const residuesAfter = await kysely
      .selectFrom('analysisResidues')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('analysisId', '=', analyses[0].id)
      .executeTakeFirstOrThrow();
    expect(Number(residuesAfter.count)).toBe(64);
  });
});

describe('replayRai (SFTP)', () => {
  beforeEach(() => {
    mockSendSachaFile.mockReset();
    mockSendSachaFile.mockResolvedValue('EMAIL');
  });

  const replayWithContent = async (
    initialState: 'INTERNAL_ERROR',
    xml: string
  ) => {
    const id = await analysisRaiRepository.insert({
      source: 'SFTP',
      edi: true,
      analysisId: null,
      laboratoryId: null,
      receivedAt: new Date(),
      state: initialState,
      payload: null,
      message: 'boom'
    });

    vi.spyOn(analysisRaiRepository, 'findLinkedDocuments').mockResolvedValue([
      { id: 'd0000000-0000-0000-0000-000000000001', filename: 'source.xml' }
    ]);
    vi.spyOn(documentService, 'getDocument').mockResolvedValue({
      id: 'd0000000-0000-0000-0000-000000000001',
      filename: 'source.xml',
      kind: 'RaiSourceFile',
      createdBy: null,
      createdAt: new Date(),
      file: Readable.from(asBuffer(xml))
    } as never);

    const rai = await analysisRaiRepository.findById(id);
    if (rai?.source !== 'SFTP') {
      throw new Error('setup: RAI SFTP introuvable');
    }
    await replayRai(rai);

    return analysisRaiRepository.findById(id);
  };

  test('INTERNAL_ERROR réparable : PROCESSED', async () => {
    const rai = await replayWithContent('INTERNAL_ERROR', validXml);
    expect(rai?.state).toBe('PROCESSED');
    expect(rai?.analysisId).not.toBeNull();
  });

  test('INTERNAL_ERROR dont la cause est une faute labo : REJECTED', async () => {
    const xml = validXml.replace(
      '<SigleConclusion>CONFORM</SigleConclusion>',
      '<SigleConclusion>INCONNU</SigleConclusion>'
    );
    const rai = await replayWithContent('INTERNAL_ERROR', xml);
    expect(rai?.state).toBe('REJECTED');
    expect(rai?.message).toMatch(/inconnue/);
  });
});
