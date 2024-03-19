import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { User1 } from '../../../database/seeds/test/001-users';
import { createServer } from '../../server';
import { genEmail, genValidPassword } from '../../../shared/test/testFixtures';

const { app } = createServer();

describe('Account routes', () => {

  describe('POST /accounts/sign-in', () => {
    const testRoute = '/api/accounts/sign-in';

    it('should receive valid email and password', async () => {
      await request(app)
        .post(testRoute)
        .send({
          email: randomstring.generate(),
          password: genValidPassword(),
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      await request(app)
        .post(testRoute)
        .send({
          email: genEmail(),
          password: '   ',
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should fail if the user is missing', async () => {
      await request(app)
        .post(testRoute)
        .send({
          email: genEmail(),
          password: genValidPassword(),
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should fail if the password is wrong', async () => {
      await request(app)
        .post(testRoute)
        .send({
          email: User1.email,
          password: genValidPassword(),
        })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should succeed if the user is found and the password is correct', async () => {
      const res = await request(app)
        .post(testRoute)
        .send({
          email: User1.email,
          password: User1.password,
        })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          userId: User1.id,
          accessToken: expect.any(String),
        })
      );
    });
  });
});
