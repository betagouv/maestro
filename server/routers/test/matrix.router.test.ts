import { constants } from 'node:http2';
import { MatrixReferentialFixture } from 'maestro-shared/test/matrixFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('Matrix router', () => {
  const { app } = createServer();

  const testRoute = '/api/matrices';

  describe('GET /matrices', () => {
    test('should get the matrix referential', async () => {
      const res = await request(app)
        .get(testRoute)
        .use(tokenProvider(Sampler1Fixture))
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.matrixKinds).toContainEqual(
        MatrixReferentialFixture.matrixKinds.find(
          (matrixKind) => matrixKind.code === 'A00GY'
        )
      );
      expect(res.body.matrices).toContainEqual(
        MatrixReferentialFixture.matrices.find(
          (matrix) => matrix.code === 'A01XF#F28.A0C0S'
        )
      );
    });
  });
});
