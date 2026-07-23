import { fakerFR } from '@faker-js/faker';
import { CER30Id } from 'maestro-shared/schema/User/User';
import {
  DAOABovinValidatedSubPlanId,
  DAOAVolailleValidatedSubPlanId,
  PPVInProgressSubPlanId,
  PPVValidatedSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminFixture,
  NationalCoordinator,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { UserCompanies, Users } from '../../../repositories/userRepository';
import { AVIVOL, CHARAL } from './001-companies';

const sachaSubPlanIds = [
  DAOAVolailleValidatedSubPlanId,
  DAOABovinValidatedSubPlanId
];

export const seed = async () => {
  await Users().insert([
    {
      id: AdminFixture.id,
      email: 'admin@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [],
      roles: ['Administrator']
    },
    {
      id: uuidv4(),
      email: 'laboratory@maestro.beta.gouv.fr',
      name: `Laboratoire - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId],
      roles: ['LaboratoryUser'],
      laboratoryId: CER30Id
    },
    {
      id: uuidv4(),
      email: 'bureau.laboratoires@maestro.beta.gouv.fr',
      name: `Bureau des laboratoires - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [],
      roles: ['LaboratoryOffice']
    },

    //PPV
    {
      id: NationalCoordinator.id,
      email: 'coordinateur.national@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId, PPVInProgressSubPlanId],
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId, PPVInProgressSubPlanId],
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId, PPVInProgressSubPlanId],
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId],
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId],
      roles: ['Sampler'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'suivi.national@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId],
      roles: ['NationalObserver']
    },
    {
      id: uuidv4(),
      email: 'suivi.regional@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: [PPVValidatedSubPlanId],
      roles: ['RegionalObserver'],
      region: '44'
    },

    //DAOA
    {
      id: uuidv4(),
      email: 'coordinateur.national.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: sachaSubPlanIds,
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: sachaSubPlanIds,
      roles: ['RegionalCoordinator'],
      region: '52'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.departemental.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: sachaSubPlanIds,
      roles: ['DepartmentalCoordinator'],
      region: '52',
      department: '85'
    },
    {
      id: SamplerDaoaFixture.id,
      email: 'preleveur.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingSubPlanIds: sachaSubPlanIds,
      roles: ['Sampler'],
      region: '52',
      department: '85'
    }
  ]);

  await UserCompanies().insert([
    {
      userId: SamplerDaoaFixture.id,
      companySiret: CHARAL.siret
    },
    {
      userId: SamplerDaoaFixture.id,
      companySiret: AVIVOL.siret
    }
  ]);
};
