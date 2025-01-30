import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { s3Service } from '../s3Service';
import { analysisHandler } from './analysis-handler';
import { ExportAnalysis } from './index';

let spyDeleteDocument = vi.spyOn(s3Service, 'deleteDocument');
let spyUploadDocument = vi.spyOn(s3Service, 'uploadDocument');
let documentId = uuidv4();

beforeEach(() => {
  vi.resetAllMocks();
  spyDeleteDocument = vi
    .spyOn(s3Service, 'deleteDocument')
    .mockResolvedValue(undefined);
  documentId = uuidv4();
  spyUploadDocument = vi
    .spyOn(s3Service, 'uploadDocument')
    .mockResolvedValue({ documentId, valid: true });
});

afterEach(async () => {
  await kysely.deleteFrom('analysis').execute();
});

test("Le fichier est updloadé sur le S3, n'est pas supprimé du S3 et est en bdd", async () => {
  const analysisToSave = {
    notes: '',
    pdfFile: new File([], 'fileName'),
    sampleReference: Sample13Fixture.reference,
    residues: [
      {
        residue: {
          kind: 'SimpleResidue',
          reference: 'RF-0002-001-PPP'
        },
        lmr: null,
        result: null,
        result_kind: 'NQ'
      }
    ]
  } as const satisfies ExportAnalysis;
  const analysisId = await analysisHandler(analysisToSave);

  expect(spyUploadDocument).toHaveBeenCalledOnce();
  expect(spyDeleteDocument).toHaveBeenCalledTimes(0);

  const document = await kysely
    .selectFrom('documents')
    .selectAll()
    .where('id', '=', documentId)
    .executeTakeFirst();
  expect(document?.kind).toBe('AnalysisReportDocument');

  const analysis = await kysely
    .selectFrom('analysis')
    .where('id', '=', analysisId)
    .selectAll()
    .executeTakeFirst();
  expect(analysis?.reportDocumentId).toBe(documentId);

  const analysisResidue = await kysely
    .selectFrom('analysisResidues')
    .where('analysisId', '=', analysisId)
    .selectAll()
    .execute();
  expect(analysisResidue).toHaveLength(1);
  expect(analysisResidue[0].reference).toBe(
    analysisToSave.residues[0].residue.reference
  );
});

test("Retourne une erreur si l'upload a échoué", async () => {
  const error = 'BOOM';
  spyUploadDocument = vi
    .spyOn(s3Service, 'uploadDocument')
    .mockResolvedValue({ error, valid: false });
  await expect(async () =>
    analysisHandler({
      notes: '',
      pdfFile: new File([], 'fileName'),
      sampleReference: Sample13Fixture.reference,
      residues: []
    })
  ).rejects.toThrowError(
    `Impossible d'uploader le PDF sur le S3: HTTP ${error}`
  );

  expect(spyUploadDocument).toHaveBeenCalledOnce();
  expect(spyDeleteDocument).toHaveBeenCalledTimes(0);
});

test("Impossible d'ajouter une analyse à un échantillon avec déjà une analyse", async () => {
  const analysis = {
    notes: '',
    pdfFile: new File([], 'fileName'),
    sampleReference: Sample13Fixture.reference,
    residues: []
  };

  await analysisHandler(analysis);
  expect(spyUploadDocument).toHaveBeenCalledTimes(1);
  await expect(async () =>
    analysisHandler(analysis)
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: Une analyse est déjà présente pour cet échantillon : GES-08-24-315-A]`
  );

  spyUploadDocument.mockReset();
  expect(spyUploadDocument).toHaveBeenCalledTimes(0);
  expect(spyDeleteDocument).toHaveBeenCalledTimes(0);
});

test("Impossible d'enregistrer l'analyse si on trouve une analyte qui ne correspond a aucun résidu complexe", async () => {
  await expect(async () =>
    analysisHandler({
      notes: '',
      pdfFile: new File([], 'fileName'),
      sampleReference: Sample13Fixture.reference,
      residues: [
        {
          residue: { kind: 'Analyte', reference: 'RF-0006-001-PPP' },
          result_kind: 'NQ',
          lmr: null,
          result: null
        }
      ]
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: Impossible de trouver le résidu complexe pour l'analyte RF-0006-001-PPP]`
  );

  expect(spyUploadDocument).toHaveBeenCalledTimes(0);
  expect(spyDeleteDocument).toHaveBeenCalledTimes(0);
});

test("Si une erreur intervient après l'upload sur le S3, on supprime le document du S3", async () => {
  spyUploadDocument = vi
    .spyOn(s3Service, 'uploadDocument')
    .mockResolvedValue({ documentId: '', valid: true });
  await expect(async () =>
    analysisHandler({
      notes: '',
      pdfFile: new File([], 'fileName'),
      sampleReference: Sample13Fixture.reference,
      residues: [
        {
          residue: { kind: 'SimpleResidue', reference: 'RF-0002-001-PPP' },
          lmr: null,
          result: null,
          result_kind: 'NQ'
        }
      ]
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[error: invalid input syntax for type uuid: ""]`
  );

  expect(spyUploadDocument).toHaveBeenCalledOnce();
  expect(spyDeleteDocument).toHaveBeenCalledOnce();
});
test('Peut enregistrer une analyse avec un résidue complexe et ses analytes associées', async () => {
  const analysisToSave = {
    notes: '',
    pdfFile: new File([], 'fileName'),
    sampleReference: Sample13Fixture.reference,
    residues: [
      {
        residue: {
          kind: 'Analyte',
          reference: 'RF-00002588-PAR'
        },
        lmr: null,
        result_kind: 'NQ',
        result: null
      },
      {
        residue: {
          kind: 'ComplexResidue',
          reference: 'RF-0008-001-PPP'
        },
        lmr: null,
        result: null,
        result_kind: 'NQ'
      },
      {
        residue: {
          kind: 'Analyte',
          reference: 'RF-00004646-PAR'
        },
        lmr: null,
        result_kind: 'NQ',
        result: null
      }
    ]
  } as const satisfies ExportAnalysis;
  const analysisId = await analysisHandler(analysisToSave);

  const analysisResidue = await kysely
    .selectFrom('analysisResidues')
    .where('analysisId', '=', analysisId)
    .selectAll()
    .execute();
  expect(analysisResidue).toHaveLength(1);
  expect(analysisResidue[0].reference).toBe(
    analysisToSave.residues[1].residue.reference
  );

  const analysisResidueAnalytes = await kysely
    .selectFrom('residueAnalytes')
    .selectAll()
    .where('analysisId', '=', analysisId)
    .orderBy('analyteNumber asc')
    .execute();
  expect(analysisResidueAnalytes).toHaveLength(2);
  expect(analysisResidueAnalytes[0].reference).toBe(
    analysisToSave.residues[0].residue.reference
  );
  expect(analysisResidueAnalytes[1].reference).toBe(
    analysisToSave.residues[2].residue.reference
  );
});
