import { constants } from 'http2';
import randomstring from 'randomstring';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { genUser } from '../../../shared/test/testFixtures';
import { Users } from '../../repositories/userRepository';
import { createServer } from '../../server';
import { tokenProvider } from '../../test/testUtils';

describe('User router', () => {
  const { app } = createServer();

  const user1 = genUser();
  const user2 = genUser();

  beforeAll(async () => {
    await Users().insert(user1);
    await Users().insert(user2);
  });

  it('should fail if the user is not authenticated', async () => {
    await request(app)
      .get(`/api/users/${user1.id}/infos`)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });

  it('should get a valid user id', async () => {
    await request(app)
      .get(`/api/users/${randomstring.generate()}/infos`)
      .use(tokenProvider(user1))
      .expect(constants.HTTP_STATUS_BAD_REQUEST);
  });

  it('should fail if the user does not exist', async () => {
    await request(app)
      .get(`/api/users/${uuidv4()}/infos`)
      .use(tokenProvider(user1))
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });

  it('should fail if the user requested is not the user authenticated', async () => {
    await request(app)
      .get(`/api/users/${user1.id}/infos`)
      .use(tokenProvider(user2))
      .expect(constants.HTTP_STATUS_FORBIDDEN);
  });

  it('should return user infos', async () => {
    const res = await request(app)
      .get(`/api/users/${user1.id}/infos`)
      .use(tokenProvider(user1))
      .expect(constants.HTTP_STATUS_OK);

    expect(res.body).toEqual({
      email: user1.email,
      roles: user1.roles,
      region: user1.region,
    });
  });
});
