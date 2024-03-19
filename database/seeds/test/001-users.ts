import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { UserApi } from '../../../server/models/UserApi';
import { usersTable } from '../../../server/repositories/userRepository';

export const User1: UserApi = {
  id: 'a3b3b3e3-3b3b-3b3b-3b3b-3b3b3b3b3b3b',
  email: 'user1@mail.fr',
  password: 'User1Valid',
};
export const User2: UserApi = {
  id: 'b3b3b3e3-3b3b-3b3b-3b3b-3b3b3b3b3b3b',
  email: 'user2@mail.fr',
  password: 'User2Valid',
};

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
