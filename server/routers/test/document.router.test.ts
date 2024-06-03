import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { genDocument, genUser } from '../../../shared/test/testFixtures';
import { Documents } from '../../repositories/documentRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Document router', () => {
  const { app } = createServer();

  const sampler1 = genUser('Sampler');
  const nationalCoordinator = genUser('NationalCoordinator');
  const document = genDocument(sampler1.id);

  beforeAll(async () => {
    await Users().insert([sampler1, nationalCoordinator]);
    await Documents().insert(document);
  });

  describe('GET /documents', () => {
    const testRoute = '/api/documents';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return all documents', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        {
          ...document,
          createdAt: document.createdAt.toISOString(),
        },
      ]);
    });
  });

  describe('POST /documents', () => {
    const testRoute = '/api/documents';
    const validBody = {
      id: uuidv4(),
      filename: randomstring.generate(),
    };

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(validBody)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the user has not the right permissions', async () => {
      await request(app)
        .post(testRoute)
        .send(validBody)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(nationalCoordinator))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ filename: 'test' });
      await badRequestTest({ ...validBody, id: 'test' });
    });

    it('should create a document', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(validBody)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        ...validBody,
        createdAt: expect.any(String),
        createdBy: nationalCoordinator.id,
        kind: 'OverviewDocument',
      });

      await expect(
        Documents().where({ id: validBody.id }).first()
      ).resolves.toEqual({
        ...validBody,
        createdAt: expect.any(Date),
        createdBy: nationalCoordinator.id,
        kind: 'OverviewDocument',
      });
    });
  });
});
