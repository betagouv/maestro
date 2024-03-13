import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { UserApi } from '../../../server/models/UserApi';
import { usersTable } from '../../../server/repositories/userRepository';
import { genUserApi } from '../../../server/test/testFixtures';

export const User1: UserApi = genUserApi();
export const User2: UserApi = genUserApi();

exports.seed = async function (knex: Knex) {
  const hash1 = await bcrypt.hash(User1.password, 10);
  const hash2 = await bcrypt.hash(User2.password, 10);
  await knex.table(usersTable).insert([
    {
      ...User1,
      password: hash1,
    },
    {
      ...User2,
      password: hash2,
    },
  ]);
};
