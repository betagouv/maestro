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
      programmingPlanKinds: ['PPV'],
      role: 'Administrator'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.national@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      programmingPlanKinds: ['PPV'],
      role: 'NationalCoordinator'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      programmingPlanKinds: ['PPV'],
      role: 'RegionalCoordinator',
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      programmingPlanKinds: ['PPV'],
      role: 'RegionalCoordinator',
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      programmingPlanKinds: ['PPV'],
      role: 'Sampler',
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      programmingPlanKinds: ['PPV'],
      role: 'Sampler',
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'suivi.national@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      role: 'NationalObserver'
    },
    {
      id: uuidv4(),
      email: 'suivi.regional@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      role: 'RegionalObserver',
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.ressource@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      role: 'SamplerAndNationalObserver',
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur-pfas@maestro.beta.gouv.fr',
      firstName: fakerFR.person.firstName(),
      lastName: fakerFR.person.lastName(),
      programmingPlanKinds: ['PFAS_EGGS', 'PFAS_MEAT'],
      role: 'Sampler',
      region: '84'
    }
  ]);
};
