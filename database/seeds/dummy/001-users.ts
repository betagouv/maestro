import { fakerFR } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../server/repositories/userRepository';

export const seed = async function () {

  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@maestro.beta.gouv.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Administrator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@maestro.beta.gouv.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@maestro.beta.gouv.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@maestro.beta.gouv.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Sampler'],
      region: '01'
    }
  ]);
};
