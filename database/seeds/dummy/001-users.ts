import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../server/repositories/userRepository';

exports.seed = async function () {
  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      roles: ['Administrator'],
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      roles: ['NationalCoordinator'],
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      roles: ['RegionalCoordinator'],
      region: '44',
    },
    {
      id: uuidv4(),
      email: 'preleveur@pspc.fr',
      password: bcrypt.hashSync('Test2024'),
      roles: ['Sampler'],
      region: '44',
    },
  ]);
};
