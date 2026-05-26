import { constants } from 'node:http2';
import {
  genPartialAnalysis,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  Sample1Item1Fixture,
  Sample11Fixture
} from 'maestro-shared/test/sampleFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import {
  Analysis,
  AnalysisResidues
} from '../../repositories/analysisRepository';
import { kysely } from '../../repositories/kysely';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Laboratory residue mapping router', () => {
  const { app } = createServer();

  describe('GET /laboratories/:laboratoryId/residue-mappings', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}/residue-mappings`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have administrationMaestro permission', async () => {
      await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should return the laboratory residue mappings', async () => {
      await kysely
        .insertInto('laboratoryResidueMappings')
        .values({
          laboratoryId: LaboratoryFixture.id,
          label: 'mapping-get-test',
          ssd2Id: 'RF-0565-001-PPP'
        })
        .onConflict((oc) =>
          oc
            .columns(['laboratoryId', 'label'])
            .doUpdateSet({ ssd2Id: 'RF-0565-001-PPP' })
        )
        .execute();

      const res = await request(app)
        .get(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            laboratoryId: LaboratoryFixture.id,
            label: 'mapping-get-test',
            ssd2Id: 'RF-0565-001-PPP'
          })
        ])
      );
    });
  });

  describe('PUT /laboratories/:laboratoryId/residue-mappings', () => {
    const testRoute = (laboratoryId: string) =>
      `/api/laboratories/${laboratoryId}/residue-mappings`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .send({ label: 'foo', ssd2Id: 'RF-0565-001-PPP' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have administrationMaestro permission', async () => {
      await request(app)
        .put(testRoute(LaboratoryFixture.id))
        .use(tokenProvider(Sampler1Fixture))
        .send({ label: 'foo', ssd2Id: 'RF-0565-001-PPP' })
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should create the mapping and apply it on matching analysisResidues', async () => {
      const label = 'put-apply-label';
      const analysis = genPartialAnalysis({
        sampleId: Sample11Fixture.id,
        createdBy: Sample11Fixture.id
      });
      const residue = genPartialResidue({
        analysisId: analysis.id,
        reference: undefined,
        residueNumber: 1,
        unknownLabel: label
      });

      await Analysis().insert([analysis]);
      await AnalysisResidues().insert([residue]);

      const res = await request(app)
        .put(testRoute(Sample1Item1Fixture.laboratoryId!))
        .use(tokenProvider(AdminFixture))
        .send({ label, ssd2Id: 'RF-0565-001-PPP' })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        laboratoryId: Sample1Item1Fixture.laboratoryId,
        label,
        ssd2Id: 'RF-0565-001-PPP'
      });

      const updated = await kysely
        .selectFrom('analysisResidues')
        .where('analysisId', '=', analysis.id)
        .selectAll()
        .execute();
      expect(updated[0]).toMatchObject({
        reference: 'RF-0565-001-PPP',
        unknownLabel: null
      });
    });

    test('should upsert the mapping with null ssd2Id and not touch analysisResidues', async () => {
      const label = 'put-null-label';
      const analysis = genPartialAnalysis({
        sampleId: Sample11Fixture.id,
        createdBy: Sample11Fixture.id
      });
      const residue = genPartialResidue({
        analysisId: analysis.id,
        reference: undefined,
        residueNumber: 1,
        unknownLabel: label
      });

      await Analysis().insert([analysis]);
      await AnalysisResidues().insert([residue]);

      await request(app)
        .put(testRoute(Sample1Item1Fixture.laboratoryId!))
        .use(tokenProvider(AdminFixture))
        .send({ label, ssd2Id: null })
        .expect(constants.HTTP_STATUS_OK);

      const residues = await kysely
        .selectFrom('analysisResidues')
        .where('analysisId', '=', analysis.id)
        .selectAll()
        .execute();
      expect(residues[0]).toMatchObject({
        reference: null,
        unknownLabel: label
      });
    });
  });
});
