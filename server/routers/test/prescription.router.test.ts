import { constants } from 'http2';
import fp from 'lodash/fp';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  NationalCoordinator,
  RegionalCoordinator,
  Sampler1Fixture,
} from '../../../database/seeds/test/001-users';
import {
  Prescription,
  PrescriptionsToDelete,
  PrescriptionUpdate,
} from '../../../shared/schema/Prescription/Prescription';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { genPrescriptions } from '../../../shared/test/prescriptionFixtures';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { genLaboratory, genNumber } from '../../../shared/test/testFixtures';
import { Laboratories } from '../../repositories/laboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Prescriptions router', () => {
  const { app } = createServer();

  const programmingPlanInProgress = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'InProgress' as ProgrammingPlanStatus,
    year: 2020,
  });
  const programmingPlanValidated = genProgrammingPlan({
    createdBy: NationalCoordinator.id,
    status: 'Validated' as ProgrammingPlanStatus,
    year: 2021,
  });
  const laboratory = genLaboratory();
  const inProgressControlPrescription = genPrescriptions({
    programmingPlanId: programmingPlanInProgress.id,
    context: 'Control',
    laboratoryId: laboratory.id,
  });
  const inProgressSurveillancePrescription = genPrescriptions({
    programmingPlanId: programmingPlanInProgress.id,
    context: 'Surveillance',
    laboratoryId: laboratory.id,
  });
  const validatedControlPrescription = genPrescriptions({
    programmingPlanId: programmingPlanValidated.id,
    context: 'Control',
    laboratoryId: laboratory.id,
  });

  beforeAll(async () => {
    await ProgrammingPlans().insert([
      programmingPlanInProgress,
      programmingPlanValidated,
    ]);
    await Laboratories().insert(laboratory);
    await Prescriptions().insert([
      ...inProgressControlPrescription,
      ...inProgressSurveillancePrescription,
      ...validatedControlPrescription,
    ]);
  });

  afterAll(async () => {
    await Prescriptions()
      .delete()
      .where('programmingPlanId', 'in', [
        programmingPlanInProgress.id,
        programmingPlanValidated.id,
      ]);
    await Laboratories().delete().where('id', laboratory.id);
    await ProgrammingPlans()
      .delete()
      .where('id', 'in', [
        programmingPlanInProgress.id,
        programmingPlanValidated.id,
      ]);
  });

  describe('GET /prescriptions', () => {
    const testRoute = (programmingPlanId: string, context: string) =>
      `/api/prescriptions?programmingPlanId=${programmingPlanId}&context=${context}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate(), 'Control')}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should get a valid context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should find all the prescriptions of the programmingPlan with Control context for a national role', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining(inProgressControlPrescription)
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining(inProgressSurveillancePrescription)
      );
      expect(res.body).not.toMatchObject(
        expect.arrayContaining(validatedControlPrescription)
      );
    });

    it('should find the regional prescriptions of the programmingPlan with Control context for a regional role', async () => {
      const res = await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.arrayContaining(
          inProgressControlPrescription.filter(
            ({ region }) => region === RegionalCoordinator.region
          )
        )
      );
    });
  });

  describe('GET /prescriptions/export', () => {
    const testRoute = (programmingPlanId: string, context: string) =>
      `/api/prescriptions/export?programmingPlanId=${programmingPlanId}&context=${context}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid programmingPlan id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate(), 'Control')}`)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should get a valid context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'invalid'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should export the prescriptions of the programmingPlan with Control context', async () => {
      await request(app)
        .get(testRoute(programmingPlanInProgress.id, 'Control'))
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);
    });
  });

  describe('POST /prescriptions', () => {
    const prescriptionsToCreate = {
      programmingPlanId: programmingPlanInProgress.id,
      context: 'Control',
      prescriptions: genPrescriptions({
        programmingPlanId: programmingPlanInProgress.id,
      }).map((prescription) =>
        fp.pick(['region', 'matrix', 'stages', 'sampleCount'])(prescription)
      ),
    };
    const testRoute = '/api/prescriptions';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(prescriptionsToCreate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive a valid programmingPlanId', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...prescriptionsToCreate,
          programmingPlanId: randomstring.generate(),
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should receive a valid context', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...prescriptionsToCreate,
          context: 'invalid',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should receive valid prescriptions', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...prescriptionsToCreate,
          prescriptions: [
            ...prescriptionsToCreate.prescriptions,
            {
              ...prescriptionsToCreate.prescriptions[0],
              sampleCount: 'invalid',
            },
          ],
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not have the permission to create prescriptions', async () => {
      await request(app)
        .post(testRoute)
        .send(prescriptionsToCreate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .post(testRoute)
        .send({
          ...prescriptionsToCreate,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create the prescriptions', async () => {
      const res = await request(app)
        .post(testRoute)
        .send(prescriptionsToCreate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        prescriptionsToCreate.prescriptions.map((prescription) => ({
          ...prescription,
          programmingPlanId: prescriptionsToCreate.programmingPlanId,
          context: prescriptionsToCreate.context,
          id: expect.any(String),
        }))
      );

      //Cleanup
      await Prescriptions()
        .whereIn(
          'id',
          (res.body as Prescription[]).map(({ id }) => id)
        )
        .delete();
    });
  });

  describe('PUT /prescriptions/{prescriptionId}', () => {
    const prescriptionUpdate: PrescriptionUpdate = {
      programmingPlanId: programmingPlanInProgress.id,
      context: 'Control',
      sampleCount: genNumber(4),
      laboratoryId: laboratory.id,
    };
    const testRoute = (
      prescriptionId: string = inProgressControlPrescription[0].id
    ) => `/api/prescriptions/${prescriptionId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive valid programmingPlanId and prescriptionId', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: randomstring.generate(),
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .put(testRoute(randomstring.generate()))
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the prescription does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the prescription does not belong to the programmingPlan', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update prescriptions', async () => {
      await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .put(testRoute())
        .send({
          ...prescriptionUpdate,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample count of the prescription for a national coordinator', async () => {
      const res = await request(app)
        .put(testRoute())
        .send(prescriptionUpdate)
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...inProgressControlPrescription[0],
        sampleCount: prescriptionUpdate.sampleCount,
      });
    });

    it('should update the laboratory of the prescription for a regional coordinator', async () => {
      const res = await request(app)
        .put(testRoute(inProgressControlPrescription[1].id))
        .send(prescriptionUpdate)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...inProgressControlPrescription[1],
        laboratoryId: prescriptionUpdate.laboratoryId,
      });
    });
  });

  describe('DELETE /prescriptions', () => {
    const prescriptionToDelete: PrescriptionsToDelete = {
      programmingPlanId: programmingPlanInProgress.id,
      context: 'Control',
      prescriptionIds: [inProgressControlPrescription[0].id],
    };

    const testRoute = '/api/prescriptions';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute)
        .send(prescriptionToDelete)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should receive a valid programmingPlanId', async () => {
      await request(app)
        .delete(testRoute)
        .send({
          ...prescriptionToDelete,
          programmingPlanId: randomstring.generate(),
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should receive a valid context', async () => {
      await request(app)
        .delete(testRoute)
        .send({
          ...prescriptionToDelete,
          context: 'invalid',
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should receive valid prescriptionIds', async () => {
      await request(app)
        .delete(testRoute)
        .send({
          ...prescriptionToDelete,
          prescriptionIds: [randomstring.generate()],
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user does not have the permission to delete prescriptions', async () => {
      await request(app)
        .delete(testRoute)
        .send(prescriptionToDelete)
        .use(tokenProvider(RegionalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the programming plan is validated', async () => {
      await request(app)
        .delete(testRoute)
        .send({
          ...prescriptionToDelete,
          programmingPlanId: programmingPlanValidated.id,
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete the prescriptions of the programmingPlan', async () => {
      await request(app)
        .delete(testRoute)
        .send({
          ...prescriptionToDelete,
          prescriptionIds: [
            ...inProgressControlPrescription,
            ...inProgressSurveillancePrescription,
            ...validatedControlPrescription,
          ].map(({ id }) => id),
        })
        .use(tokenProvider(NationalCoordinator))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Prescriptions()
          .where({ programmingPlanId: programmingPlanInProgress.id })
          .andWhere('context', 'Control')
          .count()
          .first()
      ).resolves.toMatchObject({ count: '0' });

      await expect(
        Prescriptions()
          .where({ programmingPlanId: programmingPlanInProgress.id })
          .andWhere('context', 'Surveillance')
          .count()
          .first()
      ).resolves.toMatchObject({ count: '18' });
      await expect(
        Prescriptions()
          .where({ programmingPlanId: programmingPlanValidated.id })
          .count()
          .first()
      ).resolves.toMatchObject({ count: '18' });
    });
  });
});
