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
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import { kysely } from '../../repositories/kysely';
import { sachaOutgoingFileRepository } from '../../repositories/sachaOutgoingFileRepository';
import { SampleItems } from '../../repositories/sampleItemRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import config from '../../utils/config';
import { documentService } from '../documentService';
import { unzip, zip } from '../zipService';
import { NumeroEtiquette, referencesFromEtiquette } from './sachaReferences';
import { readSachaExample } from './testUtils';

const { sftpFiles } = vi.hoisted(() => ({
  sftpFiles: new Map<string, Buffer>()
}));
vi.mock('ssh2-sftp-client', () => ({
  default: class {
    connect = async () => undefined;
    end = async () => true;
    list = async (directory: string) =>
      [...sftpFiles.keys()]
        .filter((key) => key.startsWith(`${directory}/`))
        .map((key) => ({ name: key.slice(directory.length + 1) }));
    get = async (remote: string) => sftpFiles.get(remote);
    put = async (content: Buffer, remote: string) => {
      sftpFiles.set(remote, content);
      return remote;
    };
    delete = async (remote: string) => {
      sftpFiles.delete(remote);
      return remote;
    };
  }
}));

const { exchangeWithSachaSftp, processSachaContent, replayRai } = await import(
  './sftpService'
);

const LAB_SIGLE = 'LABTEST';
const SAMPLE_ID = 'aaaaaaaa-bbbb-cccc-dddd-000000000098';
const KNOWN_ETIQUETTE = '029600260009992026113002';
const UNKNOWN_ETIQUETTE = '029600260008882026113002';

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

const acknowledgementOf = (
  response: Awaited<ReturnType<typeof processSachaContent>>
) => {
  if (!response.acknowledgement) throw new Error('aucun AN01 généré');
  return response.acknowledgement;
};

describe('sftpService pipeline (decode, process, respond)', () => {
  const { referenceSuffix, itemNumber } = referencesFromEtiquette(
    NumeroEtiquette.parse(KNOWN_ETIQUETTE)
  );

  beforeAll(async () => {
    await kysely
      .updateTable('laboratories')
      .set({
        sachaActivated: true,
        sachaSigle: LAB_SIGLE
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
        reference: `GES-${referenceSuffix}`
      })
    );
    await SampleItems().insert([
      genSampleItem({
        sampleId: SAMPLE_ID,
        itemNumber,
        copyNumber: 1,
        recipientKind: 'Laboratory',
        laboratoryId: LaboratoryFixture.id,
        substanceKinds: ['Mono', 'Multi']
      })
    ]);
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

    const { xmlFile } = acknowledgementOf(response);
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

    const { xmlFile, laboratory } = acknowledgementOf(response);
    expect(xmlFile.fileType).toBe('AN01');
    expect(xmlFile.content).toContain('<MessageNonAcquittement>');
    expect(xmlFile.content).not.toContain('<MessageAcquittement>');
    expect(xmlFile.content).toContain('INCONNU');
    // The recipient of the NACK is resolved from the incoming Emetteur.Sigle.
    expect(laboratory.id).toBe(LaboratoryFixture.id);
    expect(laboratory.sacha?.sigle).toBe(LAB_SIGLE);
  });

  test('faute interne (analyte non mappé) : INTERNAL_ERROR, aucun AN01', async () => {
    const xml = validXml.replace(
      '<SigleAnalyte>ALD</SigleAnalyte>',
      '<SigleAnalyte>ZZZUNKNOWN</SigleAnalyte>'
    );

    const response = await run(xml);

    expect(response.state).toBe('INTERNAL_ERROR');
    expect(response.message).toContain('ZZZUNKNOWN');
    expect(response.acknowledgement).toBeNull();
  });

  test('échantillon introuvable : REJECTED adressé via l’enveloppe (indépendant de la résolution)', async () => {
    const xml = validXml.replace(KNOWN_ETIQUETTE, UNKNOWN_ETIQUETTE);

    const response = await run(xml);

    expect(response.state).toBe('REJECTED');
    expect(response.message).toMatch(/Échantillon introuvable/);

    const { xmlFile, laboratory } = acknowledgementOf(response);
    expect(xmlFile.content).toContain('<MessageNonAcquittement>');
    expect(laboratory.sacha?.sigle).toBe(LAB_SIGLE);
  });

  test('XSD invalide mais nom de fichier adressable : REJECTED (fichier invalide)', async () => {
    const xml = validXml.replace(
      '<ValeurResultatQuantitatif>0.001</ValeurResultatQuantitatif>',
      '<ValeurResultatQuantitatif>ABC</ValeurResultatQuantitatif>'
    );

    const response = await run(xml);

    expect(response.state).toBe('REJECTED');
    expect(response.message).toContain('fichier invalide');

    const { xmlFile, laboratory } = acknowledgementOf(response);
    expect(xmlFile.content).toContain('<MessageNonAcquittement>');
    // Addressing is resolved from the file name, not from the invalid XML.
    expect(laboratory.sacha?.sigle).toBe(LAB_SIGLE);
    expect(xmlFile.content).toContain(`RA01${LAB_SIGLE}DDSV08260101120000000`);
  });

  test('XSD invalide + nom de fichier hors convention : INTERNAL_ERROR, aucun AN01', async () => {
    const xml = validXml.replace(/<Emetteur>[\s\S]*?<\/Emetteur>/, '');

    const response = await run(xml, 'fichier-hors-convention.xml');

    expect(response.state).toBe('INTERNAL_ERROR');
    expect(response.message).toMatch(/non adressable/);
    expect(response.acknowledgement).toBeNull();
  });

  test('XSD valide mais sans Resultats (AN01) : INTERNAL_ERROR, aucun AN01', async () => {
    const xml = readSachaExample('example-an-1.xml');

    const response = await run(xml);

    expect(response.state).toBe('INTERNAL_ERROR');
    expect(response.message).toContain('XML conforme à la XSD');
    expect(response.acknowledgement).toBeNull();
  });
});

describe('replayRai (SFTP)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

  test('INTERNAL_ERROR réparable : PROCESSED, AN01 mis en file', async () => {
    const rai = await replayWithContent('INTERNAL_ERROR', validXml);
    expect(rai?.state).toBe('PROCESSED');
    expect(rai?.analysisId).not.toBeNull();

    const outgoingFiles = await kysely
      .selectFrom('sachaOutgoingFile')
      .selectAll()
      .where('analysisRaiId', '=', rai!.id)
      .execute();
    expect(outgoingFiles).toMatchObject([
      {
        fileType: 'AN01',
        depositedAt: null,
        laboratoryId: LaboratoryFixture.id
      }
    ]);
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

describe('exchangeWithSachaSftp', () => {
  const RAI_DIR = 'uploads/Labo-Sigal-Maestro/RA01';
  const RAI_FILENAME = `RA01${LAB_SIGLE}DDSV08260101120000000.xml`;

  const putRaiArchive = (
    baseName: string,
    files: Record<string, string>,
    withTrigger = true
  ) => {
    sftpFiles.set(
      `${RAI_DIR}/${baseName}.zip`,
      Buffer.from(
        zip(
          Object.fromEntries(
            Object.entries(files).map(([name, xml]) => [name, asBuffer(xml)])
          )
        )
      )
    );
    if (withTrigger) {
      sftpFiles.set(`${RAI_DIR}/Decl_${baseName}`, Buffer.alloc(0));
    }
  };

  const findRaisReceivedSince = (since: Date) =>
    kysely
      .selectFrom('analysisRai')
      .selectAll()
      .where('receivedAt', '>=', since)
      .execute();

  beforeAll(() => {
    config.sigal.sftp = {
      ...config.sigal.sftp,
      privateKey: 'private-key',
      passphrase: 'passphrase',
      host: 'sftp.test',
      username: 'maestro'
    };
  });

  beforeEach(() => {
    sftpFiles.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('zip RA01 déclenché : archivé, retiré du SFTP, traité, et son AN01 part dans le zip du cycle', async () => {
    const since = new Date();
    putRaiArchive('RA01_2611171300', {
      [`${LAB_SIGLE}/${RAI_FILENAME}`]: validXml
    });

    await exchangeWithSachaSftp();

    expect(
      [...sftpFiles.keys()].filter((key) => key.startsWith(RAI_DIR))
    ).toEqual([]);

    const archives = await kysely
      .selectFrom('documents')
      .select('kind')
      .where('filename', '=', 'RA01_2611171300.zip')
      .execute();
    expect(archives).toEqual([{ kind: 'RaiSourceFile' }]);

    const rais = await findRaisReceivedSince(since);
    expect(rais).toMatchObject([{ state: 'PROCESSED', source: 'SFTP' }]);

    const outgoingFile = await kysely
      .selectFrom('sachaOutgoingFile')
      .selectAll()
      .where('analysisRaiId', '=', rais[0].id)
      .executeTakeFirstOrThrow();
    expect(outgoingFile.fileType).toBe('AN01');
    expect(outgoingFile.depositedAt).not.toBeNull();

    const zipPath = `/uploads/Maestro-Sigal-Labo/AN01/${outgoingFile.zipName}`;
    const archive = sftpFiles.get(zipPath);
    expect(archive).toBeDefined();
    expect(
      sftpFiles.get(
        `/uploads/Maestro-Sigal-Labo/AN01/Decl_${outgoingFile.zipName?.replace('.zip', '')}`
      )
    ).toEqual(Buffer.alloc(0));
    expect(Object.keys(unzip(new Uint8Array(archive!)))).toContain(
      `${LAB_SIGLE}/${outgoingFile.fileName}.xml`
    );
  });

  test('zip sans déclencheur : laissé sur le SFTP, non traité', async () => {
    const since = new Date();
    putRaiArchive('RA01_2611171301', { [RAI_FILENAME]: validXml }, false);

    await exchangeWithSachaSftp();

    expect(sftpFiles.has(`${RAI_DIR}/RA01_2611171301.zip`)).toBe(true);
    expect(await findRaisReceivedSince(since)).toEqual([]);
  });

  test('échec de mise en file de l’AN01 : RAI en INTERNAL_ERROR, rejouable sans doublon d’analyse', async () => {
    const since = new Date();
    vi.spyOn(sachaOutgoingFileRepository, 'insert').mockRejectedValueOnce(
      new Error('base indisponible')
    );
    putRaiArchive('RA01_2611171302', { [RAI_FILENAME]: validXml });

    await exchangeWithSachaSftp();

    const [rai] = await findRaisReceivedSince(since);
    expect(rai).toMatchObject({
      state: 'INTERNAL_ERROR',
      message: 'base indisponible'
    });
    expect(rai.analysisId).not.toBeNull();

    const replayable = await analysisRaiRepository.findById(rai.id);
    if (replayable?.source !== 'SFTP') {
      throw new Error('setup: RAI SFTP introuvable');
    }
    await replayRai(replayable);

    expect(await analysisRaiRepository.findById(rai.id)).toMatchObject({
      state: 'PROCESSED'
    });
    const outgoingFiles = await kysely
      .selectFrom('sachaOutgoingFile')
      .select('fileType')
      .where('analysisRaiId', '=', rai.id)
      .execute();
    expect(outgoingFiles).toEqual([{ fileType: 'AN01' }]);
    const analyses = await kysely
      .selectFrom('analysis')
      .select('id')
      .where('sampleId', '=', SAMPLE_ID)
      .execute();
    expect(analyses).toHaveLength(1);
  });
});
