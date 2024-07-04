import { constants } from 'http2';
import request from 'supertest';
import { Region, Regions } from '../../../shared/referential/Region';
import { genAnalysisToCreate } from '../../../shared/test/analysisFixtures';
import {
  genCompany,
  genDocument,
  genPartialSample,
  genProgrammingPlan,
  genUser,
  oneOf,
} from '../../../shared/test/testFixtures';
import { Analysis } from '../../repositories/analysisRepository';
import { Companies } from '../../repositories/companyRepository';
import { Documents } from '../../repositories/documentRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import {
  formatPartialSample,
  Samples,
} from '../../repositories/sampleRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Analysis router', () => {
  const { app } = createServer();

  const region1 = '44' as Region;
  const sampler1 = { ...genUser('Sampler'), region: region1 };
  const nationalCoordinator = genUser('NationalCoordinator');
  const programmingPlan = genProgrammingPlan(nationalCoordinator.id);
  const company = genCompany();
  const sample1 = {
    ...genPartialSample(sampler1, programmingPlan.id, company),
    department: oneOf(Regions[region1].departments),
  };
  const document = genDocument(sampler1.id);

  beforeAll(async () => {
    await Users().insert([sampler1, nationalCoordinator]);
    await ProgrammingPlans().insert(programmingPlan);
    await Companies().insert(company);
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
          .use(tokenProvider(sampler1))
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
        .use(tokenProvider(nationalCoordinator))
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
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...analysis,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: sampler1.id,
        })
      );

      await expect(
        Analysis().where({ id: res.body.id }).first()
      ).resolves.toBeDefined();
    });
  });
});
