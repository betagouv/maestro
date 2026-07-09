import type { EmailRaiPayload } from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { Sample13Fixture } from 'maestro-shared/test/sampleFixtures';
import { afterEach, describe, expect, test } from 'vitest';
import { analysisRaiRepository } from './analysisRaiRepository';
import { analysisRepository } from './analysisRepository';
import { documentRepository } from './documentRepository';
import { kysely } from './kysely';

const emailPayload: EmailRaiPayload = {
  emails: [
    {
      messageUid: '42',
      subject: 'Résultats analyse',
      from: 'labo@example.com',
      date: new Date('2024-01-15T10:00:00Z')
    }
  ]
};

afterEach(async () => {
  await kysely.deleteFrom('analysisRai').execute();
});

describe('analysisRaiRepository', () => {
  describe('insert', () => {
    test('insère une RAI EMAIL PROCESSED et la retrouve', async () => {
      const receivedAt = new Date('2024-01-15T10:00:00Z');

      const id = await analysisRaiRepository.insert({
        source: 'EMAIL',
        edi: false,
        state: 'PROCESSED',
        analysisId: null,
        laboratoryId: null,
        payload: emailPayload,
        message: null,
        receivedAt
      });

      const found = await analysisRaiRepository.findById(id);

      expect(found).not.toBeNull();
      expect(found!.source).toBe('EMAIL');
      expect(found!.edi).toBe(false);
      expect(found!.state).toBe('PROCESSED');
      expect(found!.analysisId).toBeNull();
      expect(found!.message).toBeNull();
      expect(found!.payload).toMatchObject({
        emails: [{ messageUid: '42' }]
      });
      expect(found!.receivedAt).toEqual(receivedAt);
    });

    test('insère une RAI SFTP ERROR et la retrouve', async () => {
      const receivedAt = new Date('2024-01-16T08:30:00Z');

      const id = await analysisRaiRepository.insert({
        source: 'SFTP',
        edi: true,
        state: 'INTERNAL_ERROR',
        analysisId: null,
        laboratoryId: null,
        payload: null,
        message: 'xml-invalid (fichier corrompu)',
        receivedAt
      });

      const found = await analysisRaiRepository.findById(id);

      expect(found).not.toBeNull();
      expect(found!.source).toBe('SFTP');
      expect(found!.edi).toBe(true);
      expect(found!.state).toBe('INTERNAL_ERROR');
      expect(found!.message).toBe('xml-invalid (fichier corrompu)');
      expect(found!.payload).toBeNull();
    });
  });

  describe('findManyWithRelations', () => {
    test('parse correctement les jointures', async () => {
      const analysisId = await analysisRepository.insert({
        sampleId: Sample13Fixture.id,
        itemNumber: 1,
        copyNumber: 1,
        status: 'Sent',
        createdAt: new Date(),
        compliance: null,
        notesOnCompliance: null
      });

      const document = genDocument({ kind: 'RaiSourceFile', createdBy: null });
      await documentRepository.insert(document);

      const receivedAt = new Date('2024-02-01T12:00:00Z');
      const raiId = await analysisRaiRepository.insert({
        source: 'EMAIL',
        edi: false,
        state: 'PROCESSED',
        analysisId,
        laboratoryId: LaboratoryFixture.id,
        payload: { emails: [] } satisfies EmailRaiPayload,
        message: null,
        receivedAt
      });
      await analysisRaiRepository.linkDocuments(raiId, [document.id]);

      const { rais, total } = await analysisRaiRepository.findManyWithRelations(
        { sampleIds: [Sample13Fixture.id] }
      );

      expect(total).toBe(1);
      expect(rais).toHaveLength(1);
      const rai = rais[0];
      expect(rai.id).toBe(raiId);
      expect(rai.source).toBe('EMAIL');
      expect(rai.state).toBe('PROCESSED');
      expect(rai.sample).toEqual({
        id: Sample13Fixture.id,
        reference: Sample13Fixture.reference
      });
      expect(rai.sampleItem).toEqual({ substanceKind: 'Any' });
      expect(rai.laboratory).toMatchObject({
        id: LaboratoryFixture.id,
        shortName: LaboratoryFixture.shortName,
        name: LaboratoryFixture.name
      });
      expect(rai.documents).toEqual([
        { id: document.id, filename: document.filename, kind: 'RaiSourceFile' }
      ]);
    });

    test('renvoie sample, sampleItem et laboratory à null pour une RAI orpheline', async () => {
      const raiId = await analysisRaiRepository.insert({
        source: 'SFTP',
        edi: true,
        state: 'INTERNAL_ERROR',
        analysisId: null,
        laboratoryId: null,
        payload: null,
        message: 'orphan',
        receivedAt: new Date()
      });

      const { rais, total } = await analysisRaiRepository.findManyWithRelations(
        { states: ['INTERNAL_ERROR'], sources: ['SFTP'] }
      );

      expect(total).toBe(1);
      expect(rais).toHaveLength(1);
      expect(rais[0].id).toBe(raiId);
      expect(rais[0].sample).toBeNull();
      expect(rais[0].sampleItem).toBeNull();
      expect(rais[0].laboratory).toBeNull();
      expect(rais[0].documents).toEqual([]);
    });

    test('renvoie un tableau vide pour findLinkedDocuments quand aucun document', async () => {
      const id = await analysisRaiRepository.insert({
        source: 'SFTP',
        edi: true,
        state: 'INTERNAL_ERROR',
        analysisId: null,
        laboratoryId: null,
        payload: null,
        message: null,
        receivedAt: new Date()
      });
      const docs = await analysisRaiRepository.findLinkedDocuments(id);
      expect(docs).toEqual([]);
    });

    test('findLinkedDocuments renvoie les documents liés à la RAI', async () => {
      const doc1 = genDocument({ kind: 'RaiSourceFile', createdBy: null });
      const doc2 = genDocument({ kind: 'RaiSourceFile', createdBy: null });
      await documentRepository.insert(doc1);
      await documentRepository.insert(doc2);

      const id = await analysisRaiRepository.insert({
        source: 'SFTP',
        edi: true,
        state: 'PROCESSED',
        analysisId: null,
        laboratoryId: null,
        payload: null,
        message: null,
        receivedAt: new Date()
      });
      await analysisRaiRepository.linkDocuments(id, [doc1.id, doc2.id]);

      const docs = await analysisRaiRepository.findLinkedDocuments(id);
      expect(docs).toHaveLength(2);
      expect(docs).toEqual(
        expect.arrayContaining([
          { id: doc1.id, filename: doc1.filename },
          { id: doc2.id, filename: doc2.filename }
        ])
      );
    });

    test('renvoie un tableau vide quand aucune RAI ne matche', async () => {
      const result = await analysisRaiRepository.findManyWithRelations({
        sampleIds: [Sample13Fixture.id]
      });
      expect(result).toEqual({ rais: [], total: 0 });
    });
  });
});
