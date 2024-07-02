import { constants } from 'http2';
import request from 'supertest';
import {
  genSubstance,
  genSubstanceAnalysis,
  genUser,
} from '../../../shared/test/testFixtures';
import {
  formatSubstanceAnalysis,
  SubstanceAnalysisTable,
  Substances,
} from '../../repositories/substanceRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Substance Router', () => {
  const { app } = createServer();

  const nationalCoordinator = genUser('NationalCoordinator');
  const substance = genSubstance();
  const substanceAnalysis1 = genSubstanceAnalysis({
    substance,
  });
  const substanceAnalysis2 = genSubstanceAnalysis({
    substance,
  });

  beforeAll(async () => {
    await Users().insert([nationalCoordinator]);
    await Substances().insert(substance);
    await SubstanceAnalysisTable().insert([
      formatSubstanceAnalysis(substanceAnalysis1),
      formatSubstanceAnalysis(substanceAnalysis2),
    ]);
  });

  describe('GET /substances/analysis', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/substances/analysis?${new URLSearchParams(params)}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find all substance analysis', async () => {
      const res = await request(app)
        .get(testRoute({}))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(
        expect.arrayContaining([substanceAnalysis1, substanceAnalysis2])
      );
    });

    it('should filter substance analysis by matrix', async () => {
      const res = await request(app)
        .get(
          testRoute({
            matrix: substanceAnalysis1.matrix,
          })
        )
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual(expect.arrayContaining([substanceAnalysis1]));
      expect(res.body).not.toEqual(
        expect.arrayContaining([substanceAnalysis2])
      );
    });
  });
});
