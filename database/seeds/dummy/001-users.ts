import { fakerFR } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { setKnexInstance } from '../../../server/repositories/db';
import { Users } from '../../../server/repositories/userRepository';

exports.seed = async function (knex: Knex) {
  setKnexInstance(knex);

  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@maestro.beta.gouv.fr.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Administrator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@maestro.beta.gouv.fr.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@maestro.beta.gouv.fr.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@maestro.beta.gouv.fr.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Sampler'],
      region: '01'
    }
  ]);
};
