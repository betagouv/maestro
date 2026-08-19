import { constants } from 'node:http2';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  AdminBGIRFixture,
  AdminFixture,
  genUser,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, test } from 'vitest';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('AdministratorBGIR permissions', () => {
  const { app } = createServer();

  describe('forbidden features', () => {
    test('should not be able to use mascarade', async () => {
      await request(app)
        .post(`/api/mascarade/${Sampler1Fixture.id}`)
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should not be able to update notices', async () => {
      await request(app)
        .put('/api/notices/root')
        .send({ type: 'root', title: 'title', description: 'description' })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should not be able to manage the specific data field dictionary', async () => {
      await request(app)
        .get('/api/specific-data-fields/sacha')
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .get('/api/sacha/commemoratifs')
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should not be able to read or update a laboratory configuration', async () => {
      await request(app)
        .get(`/api/laboratories/${LaboratoryFixture.id}/config`)
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);

      await request(app)
        .put(`/api/laboratories/${LaboratoryFixture.id}/config`)
        .send({
          emails: ['contact@lab.fr'],
          emailsAnalysisResult: ['results@lab.fr'],
          legacyDai: false,
          sacha: { activated: false, sigle: null, communication: null }
        })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });
  });

  describe('privilege escalation', () => {
    test('should not be able to create a Maestro administrator', async () => {
      await request(app)
        .post('/api/users')
        .send(genUser({ roles: ['AdministratorMaestro'], stages: [] }))
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should not be able to promote an existing user to Maestro administrator', async () => {
      await request(app)
        .put(`/api/users/${Sampler1Fixture.id}`)
        .send({ ...Sampler1Fixture, roles: ['AdministratorMaestro'] })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should not be able to touch an existing Maestro administrator', async () => {
      await request(app)
        .put(`/api/users/${AdminFixture.id}`)
        .send({ ...AdminFixture, roles: ['AdministratorBGIR'] })
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should still be able to create a BGIR peer', async () => {
      await request(app)
        .post('/api/users')
        .send(genUser({ roles: ['AdministratorBGIR'], stages: [] }))
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_CREATED);
    });
  });

  describe('retained features', () => {
    test('should still read the specific data fields used by the plan configuration', async () => {
      await request(app)
        .get('/api/specific-data-fields')
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should still read the laboratory residue mappings', async () => {
      await request(app)
        .get(`/api/laboratories/${LaboratoryFixture.id}/residue-mappings`)
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_OK);
    });

    test('should still access the DAI administration', async () => {
      await request(app)
        .get('/api/analysis-dai')
        .use(tokenProvider(AdminBGIRFixture))
        .expect(constants.HTTP_STATUS_OK);
    });
  });
});
