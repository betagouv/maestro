import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../repositories/userRepository';

export const seed = async function () {
  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PPV',
      roles: ['Administrator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PPV',
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PPV',
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PPV',
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PPV',
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PPV',
      roles: ['Sampler'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur.pfas@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      domain: 'PFAS',
      roles: ['Sampler'],
      region: '75'
    }
  ]);
};
