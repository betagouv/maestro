import { constants } from 'node:http2';
import type {
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAInProgressVolailleSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { DAOAVolailleFieldConfigs } from 'maestro-shared/test/specificDataFixtures';
import {
  AdminFixture,
  LaboratoryOfficeUserFixture,
  LaboratoryUserFixture,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { kysely } from '../../repositories/kysely';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('SpecificDataFieldConfig router', () => {
  const { app } = createServer();

  const forbiddenRequestTest = async (
    user: UserRefined,
    method: 'get' | 'post' | 'put' | 'delete',
    route: string,
    body?: Record<string, unknown> | unknown[]
  ) =>
    request(app)
      [method](route)
      .send(body)
      .use(tokenProvider(user))
      .expect(constants.HTTP_STATUS_FORBIDDEN);

  describe('GET /specific-data-fields', () => {
    const testRoute = '/api/specific-data-fields';

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(Sampler1Fixture, 'get', testRoute);
      await forbiddenRequestTest(NationalCoordinator, 'get', testRoute);
      await forbiddenRequestTest(LaboratoryUserFixture, 'get', testRoute);
      await forbiddenRequestTest(LaboratoryOfficeUserFixture, 'get', testRoute);
    });

    test('should return all fields', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      for (const field of res.body) {
        expect(field).toMatchObject({
          id: expect.any(String),
          key: expect.any(String),
          inputType: expect.any(String),
          label: expect.any(String),
          options: expect.any(Array)
        });
      }
    });
  });

  describe('POST /specific-data-fields', () => {
    const testRoute = '/api/specific-data-fields';
    const testKey = 'testAdminFieldPost';

    afterAll(async () => {
      await kysely
        .deleteFrom('specificDataFields')
        .where('key', '=', testKey)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ key: testKey, inputType: 'text', label: 'Test' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(Sampler1Fixture, 'post', testRoute, {
        key: testKey,
        inputType: 'text',
        label: 'Test'
      });
      await forbiddenRequestTest(NationalCoordinator, 'post', testRoute, {
        key: testKey,
        inputType: 'text',
        label: 'Test'
      });
      await forbiddenRequestTest(LaboratoryUserFixture, 'post', testRoute, {
        key: testKey,
        inputType: 'text',
        label: 'Test'
      });
      await forbiddenRequestTest(
        LaboratoryOfficeUserFixture,
        'post',
        testRoute,
        {
          key: testKey,
          inputType: 'text',
          label: 'Test'
        }
      );
    });

    test('should create a field', async () => {
      const res = await request(app)
        .post(testRoute)
        .use(tokenProvider(AdminFixture))
        .send({ key: testKey, inputType: 'text', label: 'Test Field' })
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        key: testKey,
        inputType: 'text',
        label: 'Test Field',
        hintText: null,
        options: []
      });
    });
  });

  describe('PUT /specific-data-fields/:fieldId', () => {
    const testKey = 'testAdminFieldPut';
    let fieldId: string;

    beforeAll(async () => {
      const field = await kysely
        .insertInto('specificDataFields')
        .values({ key: testKey, inputType: 'text', label: 'Put Test' })
        .returning('id')
        .executeTakeFirstOrThrow();
      fieldId = field.id;
    });

    afterAll(async () => {
      await kysely
        .deleteFrom('specificDataFields')
        .where('key', '=', testKey)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(`/api/specific-data-fields/${fieldId}`)
        .send({ label: 'Updated' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(
        Sampler1Fixture,
        'put',
        `/api/specific-data-fields/${fieldId}`,
        { label: 'Updated' }
      );
      await forbiddenRequestTest(
        NationalCoordinator,
        'put',
        `/api/specific-data-fields/${fieldId}`,
        { label: 'Updated' }
      );
      await forbiddenRequestTest(
        LaboratoryUserFixture,
        'put',
        `/api/specific-data-fields/${fieldId}`,
        { label: 'Updated' }
      );
      await forbiddenRequestTest(
        LaboratoryOfficeUserFixture,
        'put',
        `/api/specific-data-fields/${fieldId}`,
        { label: 'Updated' }
      );
    });

    test('should update a field', async () => {
      const res = await request(app)
        .put(`/api/specific-data-fields/${fieldId}`)
        .use(tokenProvider(AdminFixture))
        .send({ label: 'Updated Label', hintText: 'A hint' })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        id: fieldId,
        key: testKey,
        label: 'Updated Label',
        hintText: 'A hint'
      });
    });
  });

  describe('DELETE /specific-data-fields/:fieldId', () => {
    const testKey = 'testAdminFieldDelete';
    let fieldId: SpecificDataFieldId;

    beforeAll(async () => {
      const field = await kysely
        .insertInto('specificDataFields')
        .values({ key: testKey, inputType: 'text', label: 'Delete Test' })
        .returning('id')
        .executeTakeFirstOrThrow();
      fieldId = field.id;
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(`/api/specific-data-fields/${fieldId}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(
        Sampler1Fixture,
        'delete',
        `/api/specific-data-fields/${fieldId}`
      );
      await forbiddenRequestTest(
        NationalCoordinator,
        'delete',
        `/api/specific-data-fields/${fieldId}`
      );
      await forbiddenRequestTest(
        LaboratoryUserFixture,
        'delete',
        `/api/specific-data-fields/${fieldId}`
      );
      await forbiddenRequestTest(
        LaboratoryOfficeUserFixture,
        'delete',
        `/api/specific-data-fields/${fieldId}`
      );
    });

    test('should delete a field', async () => {
      await request(app)
        .delete(`/api/specific-data-fields/${fieldId}`)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const remaining = await kysely
        .selectFrom('specificDataFields')
        .select('id')
        .where('id', '=', fieldId)
        .executeTakeFirst();
      expect(remaining).toBeUndefined();
    });
  });

  describe('POST /specific-data-fields/:fieldId/options', () => {
    const testKey = 'testAdminOptionPost';
    let fieldId: string;

    beforeAll(async () => {
      const field = await kysely
        .insertInto('specificDataFields')
        .values({
          key: testKey,
          inputType: 'select',
          label: 'Option Post Test'
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      fieldId = field.id;
    });

    afterAll(async () => {
      await kysely
        .deleteFrom('specificDataFields')
        .where('key', '=', testKey)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(`/api/specific-data-fields/${fieldId}/options`)
        .send({ value: 'v1', label: 'Option 1', order: 1 })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(
        Sampler1Fixture,
        'post',
        `/api/specific-data-fields/${fieldId}/options`,
        { value: 'v1', label: 'Option 1', order: 1 }
      );
      await forbiddenRequestTest(
        NationalCoordinator,
        'post',
        `/api/specific-data-fields/${fieldId}/options`,
        { value: 'v1', label: 'Option 1', order: 1 }
      );
      await forbiddenRequestTest(
        LaboratoryUserFixture,
        'post',
        `/api/specific-data-fields/${fieldId}/options`,
        { value: 'v1', label: 'Option 1', order: 1 }
      );
      await forbiddenRequestTest(
        LaboratoryOfficeUserFixture,
        'post',
        `/api/specific-data-fields/${fieldId}/options`,
        { value: 'v1', label: 'Option 1', order: 1 }
      );
    });

    test('should create an option', async () => {
      const res = await request(app)
        .post(`/api/specific-data-fields/${fieldId}/options`)
        .use(tokenProvider(AdminFixture))
        .send({ value: 'v1', label: 'Option 1', order: 1 })
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        value: 'v1',
        label: 'Option 1',
        order: 1
      });
    });
  });

  describe('PUT /specific-data-fields/:fieldId/options/:optionId', () => {
    const testKey = 'testAdminOptionPut';
    let fieldId: string;
    let optionId: string;

    beforeAll(async () => {
      const field = await kysely
        .insertInto('specificDataFields')
        .values({ key: testKey, inputType: 'select', label: 'Option Put Test' })
        .returning('id')
        .executeTakeFirstOrThrow();
      fieldId = field.id;

      const opt = await kysely
        .insertInto('specificDataFieldOptions')
        .values({
          fieldKey: testKey,
          value: 'v1',
          label: 'Option 1',
          order: 1,
          sachaCommemoratifValueSigle: null
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      optionId = opt.id;
    });

    afterAll(async () => {
      await kysely
        .deleteFrom('specificDataFields')
        .where('key', '=', testKey)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(`/api/specific-data-fields/${fieldId}/options/${optionId}`)
        .send({ label: 'Updated Option' })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(
        Sampler1Fixture,
        'put',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`,
        { label: 'Updated Option' }
      );
      await forbiddenRequestTest(
        NationalCoordinator,
        'put',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`,
        { label: 'Updated Option' }
      );
      await forbiddenRequestTest(
        LaboratoryUserFixture,
        'put',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`,
        { label: 'Updated Option' }
      );
      await forbiddenRequestTest(
        LaboratoryOfficeUserFixture,
        'put',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`,
        { label: 'Updated Option' }
      );
    });

    test('should update an option', async () => {
      const res = await request(app)
        .put(`/api/specific-data-fields/${fieldId}/options/${optionId}`)
        .use(tokenProvider(AdminFixture))
        .send({ label: 'Updated Option', order: 2 })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        id: optionId,
        value: 'v1',
        label: 'Updated Option',
        order: 2
      });
    });
  });

  describe('DELETE /specific-data-fields/:fieldId/options/:optionId', () => {
    const testKey = 'testAdminOptionDelete';
    let fieldId: string;
    let optionId: SpecificDataFieldOptionId;

    beforeAll(async () => {
      const field = await kysely
        .insertInto('specificDataFields')
        .values({
          key: testKey,
          inputType: 'select',
          label: 'Option Delete Test'
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      fieldId = field.id;

      const opt = await kysely
        .insertInto('specificDataFieldOptions')
        .values({
          fieldKey: testKey,
          value: 'v1',
          label: 'Option 1',
          order: 1,
          sachaCommemoratifValueSigle: null
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      optionId = opt.id;
    });

    afterAll(async () => {
      await kysely
        .deleteFrom('specificDataFields')
        .where('key', '=', testKey)
        .execute();
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(`/api/specific-data-fields/${fieldId}/options/${optionId}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(
        Sampler1Fixture,
        'delete',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`
      );
      await forbiddenRequestTest(
        NationalCoordinator,
        'delete',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`
      );
      await forbiddenRequestTest(
        LaboratoryUserFixture,
        'delete',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`
      );
      await forbiddenRequestTest(
        LaboratoryOfficeUserFixture,
        'delete',
        `/api/specific-data-fields/${fieldId}/options/${optionId}`
      );
    });

    test('should delete an option', async () => {
      await request(app)
        .delete(`/api/specific-data-fields/${fieldId}/options/${optionId}`)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const remaining = await kysely
        .selectFrom('specificDataFieldOptions')
        .select('id')
        .where('id', '=', optionId)
        .executeTakeFirst();
      expect(remaining).toBeUndefined();
    });
  });

  describe('GET /programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields', () => {
    const testRoute = `/api/programming-plans/${DAOAInProgressProgrammingPlanFixture.id}/sub-plans/${DAOAInProgressVolailleSubPlanId}/specific-data-fields`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should return the resolved sampler form to any authenticated user', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        DAOAVolailleFieldConfigs.map(({ field }) => ({
          field: { key: field.key }
        }))
      );
    });
  });
});
