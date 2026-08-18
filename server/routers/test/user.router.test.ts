import { constants } from 'node:http2';
import { fakerFR } from '@faker-js/faker';
import { COOKIE_MAESTRO_ACCESS_TOKEN } from 'maestro-shared/constants';
import type { Region } from 'maestro-shared/referential/Region';
import { Regions } from 'maestro-shared/referential/Region';
import {
  DAOAVolailleValidatedSubPlanFixture,
  PPVValidatedSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  genUser,
  NationalCoordinator,
  NationalCoordinatorDaoaFixture,
  Region1Fixture,
  Region2Fixture,
  RegionalCoordinator,
  Sampler1Fixture,
  Sampler2Fixture,
  SamplerDaoaFixture,
  SamplerDromFixture
} from 'maestro-shared/test/userFixtures';
import { expectArrayToContainElements } from 'maestro-shared/test/utils';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  UserCompanies,
  Users,
  userRepository
} from '../../repositories/userRepository';
import { createServer } from '../../server';
import {
  mockMailCreateContact,
  mockMailDeleteContact,
  mockMailUpdateContact
} from '../../test/setupTests';
import {
  accessTokenTest,
  TEST_LOGGED_SECRET,
  tokenProvider
} from '../../test/testUtils';

const PPVStages = PPVValidatedSubPlanFixture.stages;
const AbattoirStages = DAOAVolailleValidatedSubPlanFixture.stages;

describe('User router', () => {
  const { app } = createServer();

  describe('GET /{userId}', () => {
    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the loggedSecret is wrong', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use((request) => {
          request.set(
            'Cookie',
            `${COOKIE_MAESTRO_ACCESS_TOKEN}=${accessTokenTest({
              userId: Sampler1Fixture.id,
              idToken: 'idToken',
              loggedSecret: 'anotherSecret'
            })}`
          );
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should get a valid user id', async () => {
      await request(app)
        .get(`/api/users/${fakerFR.string.alphanumeric(32)}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should fail if the user does not exist', async () => {
      await request(app)
        .get(`/api/users/${uuidv4()}`)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail if the user requested has no common region with the authenticated user', async () => {
      await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use(tokenProvider(Sampler2Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should return user', async () => {
      const res = await request(app)
        .get(`/api/users/${Sampler1Fixture.id}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual({
        id: Sampler1Fixture.id,
        stages: Sampler1Fixture.stages,
        programmingSubPlans: expect.arrayContaining(
          Sampler1Fixture.programmingSubPlans.map(({ id }) =>
            expect.objectContaining({ id })
          )
        ),
        email: Sampler1Fixture.email,
        name: Sampler1Fixture.name,
        roles: Sampler1Fixture.roles,
        region: Sampler1Fixture.region,
        department: Sampler1Fixture.department || null,
        companies: Sampler1Fixture.companies || null,
        laboratoryId: null,
        disabled: false,
        certified: true
      });
    });
  });

  describe('GET /', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/users?${new URLSearchParams(params).toString()}`;

    const disabledSampler = genUser({
      roles: ['Sampler'],
      region: Region1Fixture,
      stages: PPVStages,
      disabled: true
    });

    beforeAll(async () => {
      await userRepository.insert(disabledSampler);
    });

    afterAll(async () => {
      await UserCompanies().delete().where('userId', disabledSampler.id);
      await Users().delete().where('id', disabledSampler.id);
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should filter users by region', async () => {
      const res = await request(app)
        .get(testRoute({ region: Sampler1Fixture.region as Region }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        expect.objectContaining({
          id: Sampler1Fixture.id
        }),
        expect.objectContaining({
          id: RegionalCoordinator.id
        })
      ]);
    });

    test('should filter users by role', async () => {
      const res = await request(app)
        .get(testRoute({ roles: 'Sampler' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        expect.objectContaining({
          id: SamplerDromFixture.id
        }),
        expect.objectContaining({
          id: Sampler1Fixture.id
        }),
        expect.objectContaining({
          id: Sampler2Fixture.id
        })
      ]);
    });

    test('should filter users by stage', async () => {
      const res = await request(app)
        .get(testRoute({}))
        .use(tokenProvider(NationalCoordinatorDaoaFixture))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        expect.objectContaining({ id: NationalCoordinatorDaoaFixture.id }),
        expect.objectContaining({ id: SamplerDaoaFixture.id })
      ]);
      expect(res.body).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: Sampler1Fixture.id })
        ])
      );
    });

    test('should return both enabled and disabled users when no disabled filter is given', async () => {
      const res = await request(app)
        .get(testRoute({}))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expectArrayToContainElements(res.body, [
        expect.objectContaining({ id: disabledSampler.id }),
        expect.objectContaining({ id: Sampler1Fixture.id })
      ]);
    });

    test('should filter users by disabled', async () => {
      const res = await request(app)
        .get(testRoute({ disabled: 'true' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toEqual([
        expect.objectContaining({ id: disabledSampler.id })
      ]);
    });

    test('should filter users by enabled', async () => {
      const res = await request(app)
        .get(testRoute({ disabled: 'false' }))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: disabledSampler.id })
        ])
      );
    });
  });

  describe('POST /', () => {
    const testRoute = () => `/api/users`;

    test('should fail if the role of the account manages nobody', async () => {
      await request(app)
        .post(testRoute())
        .use(tokenProvider(NationalCoordinator))
        .send(genUser({}))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the email is known', async () => {
      await request(app)
        .post(testRoute())
        .send(genUser({ email: AdminFixture.email }))
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    });

    test('should create an user', async () => {
      const newUser = genUser({});
      await request(app)
        .post(testRoute())
        .send(newUser)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(mockMailCreateContact).toHaveBeenCalledWith(
        expect.objectContaining({ email: newUser.email })
      );
    });

    test('should create a sampler uncertified', async () => {
      const newSampler = genUser({ roles: ['Sampler'] });
      await request(app)
        .post(testRoute())
        .send(newSampler)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      const created = await userRepository.findOne(newSampler.email);
      expect(created?.certified).toBe(false);
    });

    test('should create any other role already certified', async () => {
      const newCoordinator = genUser({ roles: ['RegionalCoordinator'] });
      await request(app)
        .post(testRoute())
        .send(newCoordinator)
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_CREATED);

      const created = await userRepository.findOne(newCoordinator.email);
      expect(created?.certified).toBe(true);
    });
  });

  describe('PUT /{userId}', () => {
    const testRoute = (userId: string) => `/api/users/${userId}`;

    test('should fail if the role of the account manages nobody', async () => {
      await request(app)
        .put(testRoute(NationalCoordinator.id))
        .send({ ...NationalCoordinator, role: 'Sampler', region: '01' })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the updated user is unknown', async () => {
      await request(app)
        .put(testRoute('55555555-5555-5555-5555-555555555550'))
        .send({ ...Sampler1Fixture, role: 'Sampler' })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('the region is required for sampler', async () => {
      await request(app)
        .put(testRoute(NationalCoordinator.id))
        .send({ ...NationalCoordinator, roles: ['Sampler'] })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should update an user', async () => {
      await request(app)
        .put(testRoute(NationalCoordinator.id))
        .send({ ...NationalCoordinator, role: 'Sampler', region: '01' })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockMailUpdateContact).toHaveBeenCalledWith(
        expect.objectContaining({ id: NationalCoordinator.id })
      );
    });

    test('should sync contact deletion when user is disabled', async () => {
      await request(app)
        .put(testRoute(NationalCoordinator.id))
        .send({ ...NationalCoordinator, disabled: true })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(mockMailDeleteContact).toHaveBeenCalledWith(
        NationalCoordinator.email
      );
    });
  });

  describe('PUT /{userId}/certification', () => {
    const testRoute = (userId: string) => `/api/users/${userId}/certification`;

    const uncertifiedSampler = genUser({
      roles: ['Sampler'],
      region: Region1Fixture,
      certified: false
    });

    const certifyingManager = genUser({
      roles: ['RegionalCoordinator'],
      region: Region1Fixture,
      department: null
    });

    const localUsers = [uncertifiedSampler, certifyingManager];

    beforeAll(async () => {
      for (const user of localUsers) {
        const userToInsert = { ...user, loggedSecrets: [TEST_LOGGED_SECRET] };
        await userRepository.insert(userToInsert);
      }
    });

    afterAll(async () => {
      for (const user of localUsers) {
        await UserCompanies().delete().where('userId', user.id);
        await Users().delete().where('id', user.id);
      }
    });

    test('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(uncertifiedSampler.id))
        .send({ certified: true })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    test('should fail if the account is not an administrator', async () => {
      await request(app)
        .put(testRoute(uncertifiedSampler.id))
        .send({ certified: true })
        .use(tokenProvider(certifyingManager))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should fail if the user is unknown', async () => {
      await request(app)
        .put(testRoute('55555555-5555-5555-5555-555555555550'))
        .send({ certified: true })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    test('should fail when certifying oneself', async () => {
      await request(app)
        .put(testRoute(AdminFixture.id))
        .send({ certified: true })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    test('should certify a sampler', async () => {
      await request(app)
        .put(testRoute(uncertifiedSampler.id))
        .send({ certified: true })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await userRepository.findUnique(uncertifiedSampler.id);
      expect(updated?.certified).toBe(true);
      expect(updated?.email).toBe(uncertifiedSampler.email);
    });

    test('should revoke the certification of a sampler', async () => {
      await request(app)
        .put(testRoute(uncertifiedSampler.id))
        .send({ certified: false })
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_OK);

      const updated = await userRepository.findUnique(uncertifiedSampler.id);
      expect(updated?.certified).toBe(false);
    });

    test('should reject a request without a certified flag', async () => {
      await request(app)
        .put(testRoute(uncertifiedSampler.id))
        .send({})
        .use(tokenProvider(AdminFixture))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should refuse any request from an uncertified sampler', async () => {
      await request(app)
        .get(`/api/users/${AdminFixture.id}`)
        .use(tokenProvider(uncertifiedSampler))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });
  });

  describe('Délégation aux profils hiérarchiques', () => {
    const Department1 = Regions[Region1Fixture].departments[0];
    const Department2 = Regions[Region1Fixture].departments[1];

    const regionalManager = genUser({
      roles: ['RegionalCoordinator'],
      region: Region1Fixture,
      department: null,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });
    const departmentalManager = genUser({
      roles: ['DepartmentalCoordinator'],
      region: Region1Fixture,
      department: Department1,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });
    const departmentalManagerAlsoSampler = genUser({
      roles: ['DepartmentalCoordinator', 'Sampler'],
      region: Region1Fixture,
      department: Department1,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });
    const targetInScope = genUser({
      roles: ['Sampler'],
      region: Region1Fixture,
      department: Department1,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });
    const targetOtherRegion = genUser({
      roles: ['Sampler'],
      region: Region2Fixture,
      department: null,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });
    const targetMultiPlan = genUser({
      roles: ['Sampler'],
      region: Region1Fixture,
      department: Department1,
      programmingSubPlans: [
        PPVValidatedSubPlanFixture,
        DAOAVolailleValidatedSubPlanFixture
      ]
    });
    const targetWithRoleOutsideMatrix = genUser({
      roles: ['DepartmentalCoordinator', 'NationalObserver'],
      region: Region1Fixture,
      department: Department1,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });

    const regionalManagerAlsoNationalObserver = genUser({
      roles: ['RegionalCoordinator', 'NationalObserver'],
      region: Region1Fixture,
      department: null,
      programmingSubPlans: [PPVValidatedSubPlanFixture]
    });

    const regionalManagerAlsoSampler = genUser({
      roles: ['RegionalCoordinator', 'Sampler'],
      region: Region1Fixture,
      department: Department1,
      programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
    });
    const targetOtherDepartmentDaoa = genUser({
      roles: ['Sampler'],
      region: Region1Fixture,
      department: Department2,
      programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
    });

    const localUsers = [
      regionalManager,
      departmentalManager,
      departmentalManagerAlsoSampler,
      regionalManagerAlsoNationalObserver,
      regionalManagerAlsoSampler,
      targetInScope,
      targetOtherRegion,
      targetMultiPlan,
      targetOtherDepartmentDaoa,
      targetWithRoleOutsideMatrix
    ];

    beforeAll(async () => {
      for (const user of localUsers) {
        const userToInsert = { ...user, loggedSecrets: [TEST_LOGGED_SECRET] };
        await userRepository.insert(userToInsert);
      }
    });

    afterAll(async () => {
      for (const user of localUsers) {
        await UserCompanies().delete().where('userId', user.id);
        await Users().delete().where('id', user.id);
      }
    });

    describe('POST /', () => {
      const testRoute = () => `/api/users`;

      test('should let a regional coordinator create a sampler of their own region', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['Sampler'],
              region: Region1Fixture,
              department: Department1,
              programmingSubPlans: [PPVValidatedSubPlanFixture]
            })
          )
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_CREATED);
      });

      test('should refuse a role outside the matrix', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['NationalObserver'],
              region: null,
              department: null,
              programmingSubPlans: [PPVValidatedSubPlanFixture]
            })
          )
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should refuse another region', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['Sampler'],
              region: Region2Fixture,
              department: null,
              programmingSubPlans: [PPVValidatedSubPlanFixture]
            })
          )
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should refuse another department for a departmental coordinator', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['Sampler'],
              region: Region1Fixture,
              department: Department2,
              programmingSubPlans: [PPVValidatedSubPlanFixture]
            })
          )
          .use(tokenProvider(departmentalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should refuse a target sharing no stage', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['Sampler'],
              region: Region1Fixture,
              department: Department1,
              programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
            })
          )
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should ignore the role selector: a manager acting as Sampler still manages', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['Sampler'],
              region: Region1Fixture,
              department: Department1,
              programmingSubPlans: [PPVValidatedSubPlanFixture]
            })
          )
          .use(tokenProvider(departmentalManagerAlsoSampler, 'Sampler'))
          .expect(constants.HTTP_STATUS_CREATED);
      });

      test('should bound the stages of the created user to the manager scope', async () => {
        const newUser = genUser({
          roles: ['Sampler'],
          region: Region1Fixture,
          department: Department1,
          programmingSubPlans: [
            PPVValidatedSubPlanFixture,
            DAOAVolailleValidatedSubPlanFixture
          ]
        });

        await request(app)
          .post(testRoute())
          .send(newUser)
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_CREATED);

        const created = (
          await userRepository.findMany({
            region: Region1Fixture,
            disabled: null
          })
        ).find((user) => user.email === newUser.email);

        expect(created?.stages).toEqual(PPVStages);
      });

      test('should ignore sub plans forged in the body', async () => {
        const newUser = genUser({
          roles: ['Sampler'],
          region: Region1Fixture,
          department: Department1,
          programmingSubPlans: [PPVValidatedSubPlanFixture]
        });

        await request(app)
          .post(testRoute())
          .send({
            ...newUser,
            programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
          })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_CREATED);

        const created = (
          await userRepository.findMany({
            region: Region1Fixture,
            disabled: null
          })
        ).find((user) => user.email === newUser.email);

        expect(created?.stages).toEqual(PPVStages);
        expect(
          created?.programmingSubPlans.every((subPlan) =>
            subPlan.stages.some((stage) => PPVStages.includes(stage))
          )
        ).toBe(true);
      });

      test('should ignore the role selector even when the active role is national', async () => {
        await request(app)
          .post(testRoute())
          .send(
            genUser({
              roles: ['Sampler'],
              region: Region1Fixture,
              department: Department1,
              programmingSubPlans: [PPVValidatedSubPlanFixture]
            })
          )
          .use(
            tokenProvider(
              regionalManagerAlsoNationalObserver,
              'NationalObserver'
            )
          )
          .expect(constants.HTTP_STATUS_CREATED);
      });
    });

    describe('PUT /{userId}', () => {
      const testRoute = (userId: string) => `/api/users/${userId}`;

      test('should refuse editing your own record, administrator included', async () => {
        await request(app)
          .put(testRoute(regionalManager.id))
          .send({ ...regionalManager, disabled: true })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);

        await request(app)
          .put(testRoute(AdminFixture.id))
          .send({ ...AdminFixture, disabled: true })
          .use(tokenProvider(AdminFixture))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should refuse a target of another region', async () => {
        await request(app)
          .put(testRoute(targetOtherRegion.id))
          .send({ ...targetOtherRegion, disabled: true })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should refuse a target carrying a role outside the matrix', async () => {
        await request(app)
          .put(testRoute(targetWithRoleOutsideMatrix.id))
          .send({ ...targetWithRoleOutsideMatrix, disabled: true })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should let a manager disable a target within scope', async () => {
        await request(app)
          .put(testRoute(targetInScope.id))
          .send({ ...targetInScope, disabled: true })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_OK);

        const updated = await userRepository.findUnique(targetInScope.id);
        expect(updated?.disabled).toBe(true);
      });

      test('should refuse moving a target out of my region', async () => {
        await request(app)
          .put(testRoute(targetInScope.id))
          .send({ ...targetInScope, region: Region2Fixture, department: null })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should refuse granting a role I cannot grant', async () => {
        await request(app)
          .put(testRoute(targetInScope.id))
          .send({
            ...targetInScope,
            roles: ['NationalCoordinator'],
            department: null
          })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_FORBIDDEN);
      });

      test('should ignore an identifier forged in the body', async () => {
        await request(app)
          .put(testRoute(targetInScope.id))
          .send({ ...targetInScope, id: targetOtherRegion.id })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_OK);

        const updated = await userRepository.findUnique(targetInScope.id);
        expect(updated?.email).toBe(targetInScope.email);

        const untouched = await userRepository.findUnique(targetOtherRegion.id);
        expect(untouched?.email).toBe(targetOtherRegion.email);
      });

      test('should refuse a body made invalid by the re-injected locked stage', async () => {
        await request(app)
          .put(testRoute(targetMultiPlan.id))
          .send({
            ...targetMultiPlan,
            stages: PPVStages,
            companies: []
          })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const untouched = await userRepository.findUnique(targetMultiPlan.id);
        expect(untouched?.companies).not.toHaveLength(0);
        expect(untouched?.stages).toEqual(
          expect.arrayContaining(AbattoirStages)
        );
      });

      test('should preserve the stages outside the manager scope', async () => {
        await request(app)
          .put(testRoute(targetMultiPlan.id))
          .send({
            ...targetMultiPlan,
            stages: PPVStages
          })
          .use(tokenProvider(regionalManager))
          .expect(constants.HTTP_STATUS_OK);

        const updated = await userRepository.findUnique(targetMultiPlan.id);
        expect((updated?.stages ?? []).sort()).toEqual(
          [...PPVStages, ...AbattoirStages].sort()
        );
      });

      test('should derive both abattoir sub plans from the single abattoir stage', async () => {
        const abattoirUser = await userRepository.findUnique(
          targetOtherDepartmentDaoa.id
        );

        expect(abattoirUser?.stages).toEqual(AbattoirStages);
        expect(
          abattoirUser?.programmingSubPlans
            .map((subPlan) => subPlan.subPlanNumber)
            .sort()
        ).toContain('M02');
      });
    });

    describe('GET /', () => {
      const testRoute = () => `/api/users`;

      test('should not widen the list when the active role is national', async () => {
        const res = await request(app)
          .get(testRoute())
          .use(
            tokenProvider(
              regionalManagerAlsoNationalObserver,
              'NationalObserver'
            )
          )
          .expect(constants.HTTP_STATUS_OK);

        expectArrayToContainElements(res.body, [
          expect.objectContaining({ id: targetMultiPlan.id })
        ]);
        expect(res.body).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: targetOtherRegion.id })
          ])
        );
      });

      test('should not narrow the list when the active role is a sampler', async () => {
        const res = await request(app)
          .get(testRoute())
          .use(tokenProvider(regionalManagerAlsoSampler, 'Sampler'))
          .expect(constants.HTTP_STATUS_OK);

        expectArrayToContainElements(res.body, [
          expect.objectContaining({ id: targetOtherDepartmentDaoa.id })
        ]);
      });
    });
  });
});
