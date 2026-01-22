import { fakerFR } from '@faker-js/faker';
import { ProgrammingPlanDAOAKindList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { UserCompanies, Users } from '../../../repositories/userRepository';

export const seed = async function () {
  const samplerDaoaId = uuidv4();

  await Users().insert([
    {
      id: uuidv4(),
      email: 'admin@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: [],
      roles: ['Administrator']
    },
    {
      id: uuidv4(),
      email: 'laboratory@maestro.beta.gouv.fr',
      name: `Laboratoire - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: [],
      roles: ['LaboratoryUser']
    },

    //PPV
    {
      id: NationalCoordinator.id,
      email: 'coordinateur.national@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'preleveur@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: uuidv4(),
      email: 'preleveur.drom@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['Sampler'],
      region: '01'
    },
    {
      id: uuidv4(),
      email: 'suivi.national@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['NationalObserver']
    },
    {
      id: uuidv4(),
      email: 'suivi.regional@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ['PPV'],
      roles: ['RegionalObserver'],
      region: '44'
    },

    //DAOA
    {
      id: uuidv4(),
      email: 'coordinateur.national.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ProgrammingPlanDAOAKindList,
      roles: ['NationalCoordinator']
    },
    {
      id: uuidv4(),
      email: 'coordinateur.regional.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ProgrammingPlanDAOAKindList,
      roles: ['RegionalCoordinator'],
      region: '52'
    },
    {
      id: uuidv4(),
      email: 'coordinateur.departemental.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ProgrammingPlanDAOAKindList,
      roles: ['DepartmentalCoordinator'],
      region: '52',
      department: '85'
    },
    {
      id: samplerDaoaId,
      email: 'preleveur.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      programmingPlanKinds: ProgrammingPlanDAOAKindList,
      roles: ['Sampler'],
      region: '52',
      department: '85'
    }
  ]);

  await UserCompanies().insert([
    {
      userId: samplerDaoaId,
      companySiret: '54695037900216'
    },
    {
      userId: samplerDaoaId,
      companySiret: '92495996800018'
    }
  ]);
};
