import { constants } from 'http2';
import fp from 'lodash/fp';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  Prescription,
  PrescriptionUpdate,
} from '../../../shared/schema/Prescription/Prescription';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  genLaboratory,
  genNumber,
  genPrescriptions,
  genProgrammingPlan,
  genUser,
} from '../../../shared/test/testFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Prescriptions router', () => {
  const { app } = createServer();

  const nationalCoordinator = genUser('NationalCoordinator');
  const regionalCoordinator = genUser('RegionalCoordinator');
  const sampler = genUser('Sampler');
  const programmingPlanInProgress = {
    ...genProgrammingPlan(nationalCoordinator.id),
    status: 'InProgress' as ProgrammingPlanStatus,
  };
  const programmingPlanValidated = {
    ...genProgrammingPlan(nationalCoordinator.id),
    status: 'Validated' as ProgrammingPlanStatus,
  };
  const prescriptions1 = genPrescriptions(programmingPlanInProgress.id);
  const prescriptions2 = genPrescriptions(programmingPlanValidated.id);
  const laboratory = genLaboratory();

  beforeAll(async () => {
    await Users().insert([nationalCoordinator, regionalCoordinator, sampler]);
    await ProgrammingPlans().insert([
      programmingPlanInProgress,
      programmingPlanValidated,
    ]);
    await Prescriptions().insert([...prescriptions1, ...prescriptions2]);
    await Laboratories().insert(laboratory);
  });

  describe('GET /programming-plans/{programmingPlanId}/prescriptions', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not have the permission to read prescriptions', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id))
        .use(tokenProvider(sampler))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should find the prescriptions of the programmingPlan', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlanInProgress.id))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(expect.arrayContaining(prescriptions1));
      expect(res.body).not.toMatchObject(
        expect.arrayContaining(prescriptions2)
      );
    });
  });

  describe('GET /programming-plans/{programmingPlanId}/prescriptions/export', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions/export`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not have the permission to read prescriptions', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id))
        .use(tokenProvider(sampler))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should export the prescriptions of the programmingPlan', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
    });
  });

  describe('POST /programming-plans/{programmingPlanId}/prescriptions', () => {
    const prescriptionsToCreate = genPrescriptions(
      programmingPlanInProgress.id
    ).map((prescription) => fp.omit(['id', 'programmingPlanId'])(prescription));
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute(programmingPlanInProgress.id))
        .send(prescriptionsToCreate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive a valid programmingPlanId', async () => {
      await request(app)
        .post(testRoute(randomstring.generate()))
        .send(prescriptionsToCreate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('sould receive valid prescriptions', async () => {
      await request(app)
        .post(testRoute(programmingPlanInProgress.id))
        .send([
          ...prescriptionsToCreate,
          { ...prescriptionsToCreate[0], sampleCount: 'invalid' },
        ])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not have the permission to create prescriptions', async () => {
      await request(app)
        .post(testRoute(programmingPlanInProgress.id))
        .send(prescriptionsToCreate)
        .use(tokenProvider(regionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .post(testRoute(programmingPlanValidated.id))
        .send(prescriptionsToCreate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create the prescriptions', async () => {
      const res = await request(app)
        .post(testRoute(programmingPlanInProgress.id))
        .send(prescriptionsToCreate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(prescriptionsToCreate);

      //Cleanup
      await Prescriptions()
        .whereIn(
          'id',
          (res.body as Prescription[]).map(({ id }) => id)
        )
        .delete();
    });
  });

  describe('PUT /programming-plans/{programmingPlanId}/prescriptions/{prescriptionId}', () => {
    const prescriptionUpdate: PrescriptionUpdate = {
      sampleCount: genNumber(4),
      laboratoryId: laboratory.id,
    };
    const testRoute = (programmingPlanId: string, prescriptionId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions/${prescriptionId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(programmingPlanInProgress.id, prescriptions1[0].id))
        .send(prescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive valid programmingPlanId and prescriptionId', async () => {
      await request(app)
        .put(testRoute(randomstring.generate(), prescriptions1[0].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(programmingPlanInProgress.id, randomstring.generate()))
        .send(prescriptionUpdate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(programmingPlanInProgress.id, uuidv4()))
        .send(prescriptionUpdate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute(programmingPlanInProgress.id, prescriptions2[0].id))
        .send(prescriptions2[0])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update prescriptions', async () => {
      await request(app)
        .put(testRoute(programmingPlanInProgress.id, prescriptions1[0].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(sampler))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .put(testRoute(programmingPlanValidated.id, prescriptions2[0].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample count of the prescription for a national coordinator', async () => {
      const res = await request(app)
        .put(testRoute(programmingPlanInProgress.id, prescriptions1[1].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...prescriptions1[1],
        sampleCount: prescriptionUpdate.sampleCount,
      });
    });

    it('should update the laboratory of the prescription for a regional coordinator', async () => {
      const res = await request(app)
        .put(testRoute(programmingPlanInProgress.id, prescriptions1[0].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(regionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...prescriptions1[0],
        laboratoryId: prescriptionUpdate.laboratoryId,
      });
    });
  });

  describe('DELETE /programming-plans/{programmingPlanId}/prescriptions', () => {
    const testRoute = (programmingPlanId: string) =>
      `/api/programming-plans/${programmingPlanId}/prescriptions`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(programmingPlanInProgress.id))
        .send([prescriptions1[0].id])
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive a valid programmingPlanId', async () => {
      await request(app)
        .delete(testRoute(randomstring.generate()))
        .send([prescriptions1[0].id])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should receive valid prescriptionIds', async () => {
      await request(app)
        .delete(testRoute(programmingPlanInProgress.id))
        .send([randomstring.generate()])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not have the permission to delete prescriptions', async () => {
      await request(app)
        .delete(testRoute(programmingPlanInProgress.id))
        .send([prescriptions1[0].id])
        .use(tokenProvider(regionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .delete(testRoute(programmingPlanValidated.id))
        .send([prescriptions2[0].id])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete the prescriptions of the programmingPlan', async () => {
      await request(app)
        .delete(testRoute(programmingPlanInProgress.id))
        .send([...prescriptions1, ...prescriptions2].map(({ id }) => id))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Prescriptions()
          .where({ programmingPlanId: programmingPlanInProgress.id })
          .count()
          .first()
      ).resolves.toMatchObject({ count: '0' });
      await expect(
        Prescriptions()
          .where({ programmingPlanId: programmingPlanValidated.id })
          .count()
          .first()
      ).resolves.toMatchObject({ count: '18' });
    });
  });
});
