import { fakerFR } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../server/repositories/userRepository';
import { Knex } from 'knex';
import { setKnexInstance } from '../../../server/repositories/db';

exports.seed = async function (knex: Knex) {
  setKnexInstance(knex)

  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@yopmail.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Administrator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@yopmail.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@yopmail.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@yopmail.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@yopmail.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@yopmail.fr',
      password: bcrypt.hashSync('Test2024'),
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      roles: ['Sampler'],
      region: '01'
    }
  ]);
};
