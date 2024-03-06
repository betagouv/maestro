import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { UserApi } from '../../../server/models/UserApi';
import userRepository, {
  usersTable,
} from '../../../server/repositories/userRepository';
import { genUserApi } from '../../../server/test/testFixtures';

export const User1: UserApi = genUserApi();

exports.seed = async function (knex: Knex) {
  const hash = await bcrypt.hash(User1.password, 10);
  await knex.table(usersTable).insert([
    userRepository.formatUserApi({
      ...User1,
      password: hash,
    }),
  ]);
};
