import { constants } from 'http2';
import request from 'supertest';
import { genCompany, genUser } from '../../../shared/test/testFixtures';
import { Companies } from '../../repositories/companyRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Company Router', () => {
  const { app } = createServer();

  const sampler = genUser('Sampler');
  const company1 = genCompany();
  const company2 = genCompany();

  beforeAll(async () => {
    await Users().insert(sampler);
    await Companies().insert([company1, company2]);
  });

  describe('GET /companies', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/companies?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find the samples with query parameters', async () => {
      const res = await request(app)
        .get(testRoute({ siret: company1.siret }))
        .use(tokenProvider(sampler))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...company1,
        },
      ]);
    });
  });
});
