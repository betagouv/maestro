import {
  AnalysisRai,
  type AnalysisRaiId,
  type EmailRaiPayload
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import { afterEach, describe, expect, test } from 'vitest';
import { analysisRaiRepository } from './analysisRaiRepository';
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

const findById = async (id: AnalysisRaiId): Promise<AnalysisRai | null> => {
  const row = await kysely
    .selectFrom('analysisRai')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return AnalysisRai.nullable().parse(row);
};

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

      const found = await findById(id);

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
        state: 'ERROR',
        analysisId: null,
        laboratoryId: null,
        payload: null,
        message: 'xml-invalid (fichier corrompu)',
        receivedAt
      });

      const found = await findById(id);

      expect(found).not.toBeNull();
      expect(found!.source).toBe('SFTP');
      expect(found!.edi).toBe(true);
      expect(found!.state).toBe('ERROR');
      expect(found!.message).toBe('xml-invalid (fichier corrompu)');
      expect(found!.payload).toBeNull();
    });
  });
});
