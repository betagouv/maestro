import { constants } from 'http2';
import request from 'supertest';
import {
  NationalCoordinator,
  Region1Fixture,
  Sampler1Fixture,
} from '../../../database/seeds/test/001-users';
import { ProgrammingPlanFixture } from '../../../database/seeds/test/002-programming-plans';
import { CompanyFixture } from '../../../database/seeds/test/003-companies';
import { Regions } from '../../../shared/referential/Region';
import { genAnalysisToCreate } from '../../../shared/test/analysisFixtures';
import { genPartialSample } from '../../../shared/test/sampleFixtures';
import { genDocument, oneOf } from '../../../shared/test/testFixtures';
import { Analysis } from '../../repositories/analysisRepository';
import db from '../../repositories/db';
import { Documents } from '../../repositories/documentRepository';
import {
  formatPartialSample,
  Samples,
} from '../../repositories/sampleRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Analysis router', () => {
  const { app } = createServer();

  const sample1 = {
    ...genPartialSample(
      Sampler1Fixture,
      ProgrammingPlanFixture.id,
      CompanyFixture
    ),
    department: oneOf(Regions[Region1Fixture].departments),
  };
  const document = genDocument(Sampler1Fixture.id);

  beforeAll(async () => {
    await db.seed.run();
    await Samples().insert(formatPartialSample(sample1));
    await Documents().insert(document);
  });

  describe('POST /analysis', () => {
    const testRoute = '/api/analysis';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(genAnalysisToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(Sampler1Fixture))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest(
        genAnalysisToCreate({
          sampleId: '123',
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          sampleId: undefined,
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          documentId: '123',
        })
      );
      await badRequestTest(
        genAnalysisToCreate({
          documentId: undefined,
        })
      );
    });

    it('should fail if the user does not have the permission to create analysis', async () => {
      await request(app)
        .post(testRoute)
        .send(genAnalysisToCreate())
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create a analysis', async () => {
      const analysis = genAnalysisToCreate({
        sampleId: sample1.id,
        documentId: document.id,
      });

      const res = await request(app)
        .post(testRoute)
        .send(analysis)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysis,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: Sampler1Fixture.id,
        })
      );

      await expect(
        Analysis().where({ id: res.body.id }).first()
      ).resolves.toMatchObject({
        ...analysis,
        id: res.body.id,
        createdAt: expect.any(Date),
        createdBy: Sampler1Fixture.id,
      });
    });
  });
});
