import { constants } from 'http2';
import {
  ProgrammingPlanKindFieldId,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { UserRefined } from 'maestro-shared/schema/User/User';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
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

  describe('POST /programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields', () => {
    const programmingPlanId = DAOAInProgressProgrammingPlanFixture.id;
    const kind = 'DAOA_VOLAILLE';
    const testKey = 'testPlanKindFieldPost';
    let fieldId: SpecificDataFieldId;
    let createdPlanKindFieldId: string;

    beforeAll(async () => {
      const field = await kysely
        .insertInto('specificDataFields')
        .values({ key: testKey, inputType: 'text', label: 'Plan Kind Post' })
        .returning('id')
        .executeTakeFirstOrThrow();
      fieldId = field.id;
    });

    afterAll(async () => {
      await kysely
        .deleteFrom('programmingPlanKindFields')
        .where('fieldId', '=', fieldId)
        .execute();
      await kysely
        .deleteFrom('specificDataFields')
        .where('key', '=', testKey)
        .execute();
    });

    const testRoute = `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields`;

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send({ fieldId, required: false, order: 99 })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the user does not have the permission', async () => {
      await forbiddenRequestTest(Sampler1Fixture, 'post', testRoute, {
        fieldId,
        required: false,
        order: 99
      });
      await forbiddenRequestTest(NationalCoordinator, 'post', testRoute, {
        fieldId,
        required: false,
        order: 99
      });
    });

    test('should add a field to a plan kind', async () => {
      const res = await request(app)
        .post(testRoute)
        .use(tokenProvider(AdminFixture))
        .send({ fieldId, required: false, order: 99 })
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        programmingPlanKind: kind,
        required: false,
        order: 99,
        field: { key: testKey }
      });
      createdPlanKindFieldId = res.body.id;
    });

    describe('PUT /programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId', () => {
      test('should fail if the user is not authenticated', async () => {
        await request(app)
          .put(
            `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${createdPlanKindFieldId}`
          )
          .send({ required: true, order: 50 })
          .expect(constants.HTTP_STATUS_UNAUTHORIZED);
      });

      test('should fail if the user does not have the permission', async () => {
        const route = `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${createdPlanKindFieldId}`;
        await forbiddenRequestTest(Sampler1Fixture, 'put', route, {
          required: true,
          order: 50
        });
        await forbiddenRequestTest(NationalCoordinator, 'put', route, {
          required: true,
          order: 50
        });
      });

      test('should update the plan kind field', async () => {
        const res = await request(app)
          .put(
            `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${createdPlanKindFieldId}`
          )
          .use(tokenProvider(AdminFixture))
          .send({ required: true, order: 50 })
          .expect(constants.HTTP_STATUS_OK);

        expect(res.body).toMatchObject({
          id: createdPlanKindFieldId,
          programmingPlanKind: kind,
          required: true,
          order: 50
        });
      });
    });

    describe('DELETE /programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId', () => {
      const deleteKey = 'testPlanKindFieldDelete';
      let deleteFieldId: SpecificDataFieldId;
      let deletePlanKindFieldId: ProgrammingPlanKindFieldId;

      beforeAll(async () => {
        const field = await kysely
          .insertInto('specificDataFields')
          .values({
            key: deleteKey,
            inputType: 'text',
            label: 'Plan Kind Delete'
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        deleteFieldId = field.id;

        const pkf = await kysely
          .insertInto('programmingPlanKindFields')
          .values({
            programmingPlanId,
            kind,
            fieldId: deleteFieldId,
            required: false,
            order: 98
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        deletePlanKindFieldId = pkf.id;
      });

      afterAll(async () => {
        await kysely
          .deleteFrom('specificDataFields')
          .where('key', '=', deleteKey)
          .execute();
      });

      test('should fail if the user is not authenticated', async () => {
        await request(app)
          .delete(
            `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${deletePlanKindFieldId}`
          )
          .expect(constants.HTTP_STATUS_UNAUTHORIZED);
      });

      test('should fail if the user does not have the permission', async () => {
        const route = `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${deletePlanKindFieldId}`;
        await forbiddenRequestTest(Sampler1Fixture, 'delete', route);
        await forbiddenRequestTest(NationalCoordinator, 'delete', route);
      });

      test('should remove the plan kind field', async () => {
        await request(app)
          .delete(
            `/api/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${deletePlanKindFieldId}`
          )
          .use(tokenProvider(AdminFixture))
          .expect(constants.HTTP_STATUS_NO_CONTENT);

        const remaining = await kysely
          .selectFrom('programmingPlanKindFields')
          .select('id')
          .where('id', '=', deletePlanKindFieldId)
          .executeTakeFirst();
        expect(remaining).toBeUndefined();
      });
    });

    describe('PUT /programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId/options', () => {
      const optionsKey = 'testPlanKindFieldOptions';
      let optionsFieldId: SpecificDataFieldId;
      let optionsPlanKindFieldId: ProgrammingPlanKindFieldId;
      let optionId: string;

      beforeAll(async () => {
        const field = await kysely
          .insertInto('specificDataFields')
          .values({
            key: optionsKey,
            inputType: 'select',
            label: 'Plan Kind Options'
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        optionsFieldId = field.id;

        const opt = await kysely
          .insertInto('specificDataFieldOptions')
          .values({
            fieldKey: optionsKey,
            value: 'v1',
            label: 'Option 1',
            order: 1,
            sachaCommemoratifValueSigle: null
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        optionId = opt.id;

        const pkf = await kysely
          .insertInto('programmingPlanKindFields')
          .values({
            programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
            kind: 'DAOA_VOLAILLE',
            fieldId: optionsFieldId,
            required: false,
            order: 97
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        optionsPlanKindFieldId = pkf.id;
      });

      afterAll(async () => {
        await kysely
          .deleteFrom('programmingPlanKindFields')
          .where('id', '=', optionsPlanKindFieldId)
          .execute();
        await kysely
          .deleteFrom('specificDataFields')
          .where('key', '=', optionsKey)
          .execute();
      });

      test('should fail if the user is not authenticated', async () => {
        await request(app)
          .put(
            `/api/programming-plans/${DAOAInProgressProgrammingPlanFixture.id}/kinds/DAOA_VOLAILLE/specific-data-fields/${optionsPlanKindFieldId}/options`
          )
          .send([optionId])
          .expect(constants.HTTP_STATUS_UNAUTHORIZED);
      });

      test('should fail if the user does not have the permission', async () => {
        await forbiddenRequestTest(
          Sampler1Fixture,
          'put',
          `/api/programming-plans/${DAOAInProgressProgrammingPlanFixture.id}/kinds/DAOA_VOLAILLE/specific-data-fields/${optionsPlanKindFieldId}/options`,
          []
        );
        await forbiddenRequestTest(
          NationalCoordinator,
          'put',
          `/api/programming-plans/${DAOAInProgressProgrammingPlanFixture.id}/kinds/DAOA_VOLAILLE/specific-data-fields/${optionsPlanKindFieldId}/options`,
          []
        );
      });

      test('should replace plan kind field options', async () => {
        await request(app)
          .put(
            `/api/programming-plans/${DAOAInProgressProgrammingPlanFixture.id}/kinds/DAOA_VOLAILLE/specific-data-fields/${optionsPlanKindFieldId}/options`
          )
          .use(tokenProvider(AdminFixture))
          .send([optionId])
          .expect(constants.HTTP_STATUS_NO_CONTENT);

        const activeOptions = await kysely
          .selectFrom('programmingPlanKindFieldOptions')
          .select('specificDataFieldOptionId')
          .where('programmingPlanKindFieldId', '=', optionsPlanKindFieldId)
          .execute();
        expect(activeOptions).toHaveLength(1);
        expect(activeOptions[0].specificDataFieldOptionId).toBe(optionId);
      });
    });
  });
});
