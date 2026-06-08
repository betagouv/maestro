import { constants } from 'node:http2';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import request from 'supertest';
import { beforeEach, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { sampleRepository } from '../../repositories/sampleRepository';
import { createServer } from '../../server';

describe('SEVES router', () => {
  const { app } = createServer();
  const testRoute = '/api/seves/update';
  const basicToken = 'basicTokenSeves';

  const validBody = {
    maestro_reference: Sample11Fixture.reference,
    seves_id: 1234,
    seves_numero: 'EP-2024-001'
  };

  beforeEach(async () => {
    await kysely
      .updateTable('samples')
      .set({ seves: null })
      .where('id', '=', Sample11Fixture.id)
      .execute();
  });

  test('should fail if the request is not authenticated', async () => {
    await request(app)
      .put(testRoute)
      .send(validBody)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);

    await request(app)
      .put(testRoute)
      .set('Authorization', 'wrongToken')
      .send(validBody)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });

  test('should fail if the body is invalid', async () => {
    await request(app)
      .put(testRoute)
      .set('Authorization', basicToken)
      .send({ maestro_reference: Sample11Fixture.reference })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);
  });

  test('should return 404 if no sample matches the reference', async () => {
    await request(app)
      .put(testRoute)
      .set('Authorization', basicToken)
      .send({ ...validBody, maestro_reference: 'UNKNOWN-REFERENCE' })
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });

  test('should store the SEVES reference on the matching sample', async () => {
    await request(app)
      .put(testRoute)
      .set('Authorization', basicToken)
      .send(validBody)
      .expect(constants.HTTP_STATUS_OK);

    const sample = await sampleRepository.findUnique(Sample11Fixture.id);

    expect(sample?.seves).toEqual({
      id: validBody.seves_id,
      numero: validBody.seves_numero
    });
  });
});
