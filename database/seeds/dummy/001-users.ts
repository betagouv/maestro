import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { UserApi } from '../../../server/models/UserApi';
import userRepository, {
  usersTable,
} from '../../../server/repositories/userRepository';

exports.seed = async function (knex: Knex) {
  await knex.table(usersTable).insert(
    userRepository.formatUserApi(<UserApi>{
      id: uuidv4(),
      email: 'test@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
    })
  );
};
