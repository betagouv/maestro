import { constants } from 'http2';
import { default as fp, default as _ } from 'lodash';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { MatrixList } from '../../../shared/foodex2/Matrix';
import { Region, RegionList, Regions } from '../../../shared/schema/Region';
import { SampleStatus } from '../../../shared/schema/Sample/SampleStatus';
import {
  genCreatedSample,
  genProgrammingPlan,
  genSample,
  genSampleItem,
  genSampleToCreate,
  genUser,
  oneOf,
} from '../../../shared/test/testFixtures';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { SampleItems } from '../../repositories/sampleItemRepository';
import {
  formatPartialSample,
  Samples,
} from '../../repositories/sampleRepository';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Sample router', () => {
  const { app } = createServer();

  const region1 = oneOf(RegionList);
  const region2 = oneOf(_.difference(RegionList, region1)) as Region;
  const sampler1 = { ...genUser('Sampler'), region: region1 };
  const sampler2 = { ...genUser('Sampler'), region: region2 };
  const nationalCoordinator = genUser('NationalCoordinator');
  const programmingPlan = genProgrammingPlan(nationalCoordinator.id);
  const sample11Id = uuidv4();
  const sampleItem1 = genSampleItem(sample11Id, 1);
  const sample11 = {
    ...genSample(sampler1.id, programmingPlan.id),
    id: sample11Id,
    items: [sampleItem1],
    status: 'DraftInfos' as SampleStatus,
    department: oneOf(Regions[region1].departments),
  };
  const sample12 = {
    ...genSample(sampler1.id, programmingPlan.id),
    id: uuidv4(),
    status: 'Draft' as SampleStatus,
    department: oneOf(Regions[region1].departments),
  };
  const sample13 = {
    ...genSample(sampler1.id, programmingPlan.id),
    id: uuidv4(),
    status: 'Sent' as SampleStatus,
    department: oneOf(Regions[region1].departments),
  };
  const sample2 = {
    ...genSample(sampler2.id, programmingPlan.id),
    status: 'DraftInfos' as SampleStatus,
    department: oneOf(Regions[region2].departments),
  };

  beforeAll(async () => {
    await Users().insert([sampler1, sampler2, nationalCoordinator]);
    await ProgrammingPlans().insert(programmingPlan);
    await Samples().insert([
      formatPartialSample(sample11),
      formatPartialSample(sample12),
      formatPartialSample(sample13),
      formatPartialSample(sample2),
    ]);
    await SampleItems().insert(sampleItem1);
  });

  describe('GET /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute(sample11.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .get(`${testRoute(randomstring.generate())}`)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .get(`${testRoute(uuidv4())}`)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user region', async () => {
      await request(app)
        .get(`${testRoute(sample11.id)}`)
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get the sample', async () => {
      const res = await request(app)
        .get(testRoute(sample11.id))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...sample11,
        createdAt: sample11.createdAt.toISOString(),
        lastUpdatedAt: sample11.lastUpdatedAt.toISOString(),
        sampledAt: sample11.sampledAt.toISOString(),
        expiryDate: sample11.expiryDate?.toISOString(),
      });
    });
  });

  describe('GET /samples', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/samples?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should find the samples with query parameters restricted to the user region', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftInfos' }))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...fp.omit(sample11, ['items']),
          createdAt: sample11.createdAt.toISOString(),
          lastUpdatedAt: sample11.lastUpdatedAt.toISOString(),
          sampledAt: sample11.sampledAt.toISOString(),
          expiryDate: sample11.expiryDate?.toISOString(),
        },
      ]);
    });

    it('should find national samples with a list of statuses', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftInfos,Draft' }))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject([
        {
          ...fp.omit(sample11, ['items']),
          createdAt: sample11.createdAt.toISOString(),
          lastUpdatedAt: sample11.lastUpdatedAt.toISOString(),
          sampledAt: sample11.sampledAt.toISOString(),
          expiryDate: sample11.expiryDate?.toISOString(),
        },
        {
          ...fp.omit(sample12, ['items']),
          createdAt: sample12.createdAt.toISOString(),
          lastUpdatedAt: sample12.lastUpdatedAt.toISOString(),
          sampledAt: sample12.sampledAt.toISOString(),
          expiryDate: sample12.expiryDate?.toISOString(),
        },
        {
          ...fp.omit(sample2, ['items']),
          createdAt: sample2.createdAt.toISOString(),
          lastUpdatedAt: sample2.lastUpdatedAt.toISOString(),
          sampledAt: sample2.sampledAt.toISOString(),
          expiryDate: sample2.expiryDate?.toISOString(),
        },
      ]);
    });
  });

  describe('GET /samples/count', () => {
    const testRoute = (params: Record<string, string>) =>
      `/api/samples/count?${new URLSearchParams(params).toString()}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .get(testRoute({}))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should count the samples with query parameters restricted to the user region', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftInfos' }))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({ count: 1 });
    });

    it('should count national samples with a list of statuses', async () => {
      const res = await request(app)
        .get(testRoute({ status: 'DraftInfos,Draft' }))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({ count: 3 });
    });
  });

  describe('POST /samples', () => {
    const testRoute = '/api/samples';

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleToCreate())
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .post(testRoute)
          .send(payload)
          .use(tokenProvider(sampler1))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest({ ...genSampleToCreate(), resytalId: '123' });
      await badRequestTest({ ...genSampleToCreate(), resytalId: '' });
      await badRequestTest({ ...genSampleToCreate(), resytalId: 123 });
      await badRequestTest({ ...genSampleToCreate(), userLocation: undefined });
      await badRequestTest({ ...genSampleToCreate(), userLocation: '123' });
      await badRequestTest({
        ...genSampleToCreate(),
        userLocation: {
          latitude: undefined,
        },
      });
      await badRequestTest({
        ...genSampleToCreate(),
        sampledAt: undefined,
      });
      await badRequestTest({
        ...genSampleToCreate(),
        programmingPlanId: undefined,
      });
      await badRequestTest({
        ...genSampleToCreate(),
        programmingPlanId: '123',
      });
      await badRequestTest({ ...genSampleToCreate(), legalContext: undefined });
      await badRequestTest({ ...genSampleToCreate(), legalContext: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: undefined });
      await badRequestTest({ ...genSampleToCreate(), department: '123' });
      await badRequestTest({ ...genSampleToCreate(), department: '' });
      await badRequestTest({ ...genSampleToCreate(), department: 123 });
    });

    it('should fail if the user does not have the permission to create samples', async () => {
      await request(app)
        .post(testRoute)
        .send(genSampleToCreate())
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should create a sample', async () => {
      const sample = genSampleToCreate(programmingPlan.id);

      const res = await request(app)
        .post(testRoute)
        .send(sample)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          ...sample,
          id: expect.any(String),
          createdAt: expect.any(String),
          createdBy: sampler1.id,
          sampledAt: sample.sampledAt.toISOString(),
          reference: expect.stringMatching(/^GES-[0-9]{2,3}-2024-1$/),
          status: 'DraftInfos',
        })
      );

      await expect(
        Samples().where({ id: res.body.id }).first()
      ).resolves.toBeDefined();
    });
  });

  describe('PUT /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send({})
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .put(`${testRoute(randomstring.generate())}`)
        .send({})
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .put(`${testRoute(uuidv4())}`)
        .send(genCreatedSample(sampler1.id))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send(sample11)
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: Record<string, unknown>) =>
        request(app)
          .put(`${testRoute(sample11.id)}`)
          .send(payload)
          .use(tokenProvider(sampler1))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest({ matrix: 123 });
    });

    const validBody = {
      ...sample11,
      matrix: oneOf(MatrixList),
    };

    it('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send(validBody)
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should be forbidden to update a sample that is already sent', async () => {
      const sample = genSample(sampler1.id, programmingPlan.id);
      await Samples().insert(
        formatPartialSample({
          ...sample,
          status: 'Sent',
          sentAt: new Date(),
        })
      );

      await request(app)
        .put(`${testRoute(sample.id)}`)
        .send(sample)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample', async () => {
      const res = await request(app)
        .put(`${testRoute(sample11.id)}`)
        .send(validBody)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject({
        ...sample11,
        createdAt: sample11.createdAt.toISOString(),
        lastUpdatedAt: expect.any(String),
        sampledAt: sample11.sampledAt.toISOString(),
        expiryDate: sample11.expiryDate?.toISOString(),
        matrix: validBody.matrix,
      });

      await expect(
        Samples()
          .where({ id: sample11.id, matrix: validBody.matrix as string })
          .first()
      ).resolves.toBeDefined();
    });
  });

  describe('PUT /samples/{sampleId}/items', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}/items`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .put(testRoute(sample11.id))
        .send([genSampleItem(sample11.id)])
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .put(testRoute(randomstring.generate()))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .put(testRoute(uuidv4()))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .put(testRoute(sample11.id))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to update samples', async () => {
      await request(app)
        .put(testRoute(sample11.id))
        .send([genSampleItem(sample11.id)])
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should get a valid body', async () => {
      const badRequestTest = async (payload?: any[]) =>
        request(app)
          .put(testRoute(sample11.id))
          .send(payload)
          .use(tokenProvider(sampler1))
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await badRequestTest();
      await badRequestTest([
        {
          ...genSampleItem(sample11.id),
          quantity: '123',
        },
      ]);
      await badRequestTest([
        {
          ...genSampleItem(sample11.id),
          quantityUnit: 123,
        },
      ]);
    });

    it('should be forbidden to update a sample that is already sent', async () => {
      const sample = genSample(sampler1.id, programmingPlan.id);
      await Samples().insert(
        formatPartialSample({
          ...sample,
          status: 'Sent',
          sentAt: new Date(),
        })
      );

      await request(app)
        .put(testRoute(sample.id))
        .send([genSampleItem(sample.id)])
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should update the sample items', async () => {
      const sampleItems = [
        genSampleItem(sample11.id, 1),
        genSampleItem(sample11.id, 2),
      ];

      await request(app)
        .put(testRoute(sample11.id))
        .send(sampleItems)
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_OK);

      await expect(
        SampleItems().where({ sampleId: sample11.id })
      ).resolves.toMatchObject(sampleItems);
    });
  });

  describe('DELETE /samples/{sampleId}', () => {
    const testRoute = (sampleId: string) => `/api/samples/${sampleId}`;

    it('should fail if the user is not authenticated', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should get a valid sample id', async () => {
      await request(app)
        .delete(testRoute(randomstring.generate()))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the sample does not exist', async () => {
      await request(app)
        .delete(testRoute(uuidv4()))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });

    it('should fail if the sample does not belong to the user', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .use(tokenProvider(sampler2))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should fail if the user does not have the permission to delete samples', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .use(tokenProvider(nationalCoordinator))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should be forbidden to delete a sample that is not in draft status', async () => {
      await request(app)
        .delete(testRoute(sample13.id))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_FORBIDDEN);
    });

    it('should delete the sample', async () => {
      await request(app)
        .delete(testRoute(sample11.id))
        .use(tokenProvider(sampler1))
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await expect(
        Samples().where({ id: sample11.id }).first()
      ).resolves.toBeUndefined();
    });
  });
});
