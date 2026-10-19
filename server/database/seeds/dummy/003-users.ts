import { fakerFR } from '@faker-js/faker';
import { stagesFromSubPlans } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { CER30Id } from 'maestro-shared/schema/User/User';
import {
  ALANRuminantsSubPlanFixture,
  ALANVolaillesSubPlanFixture,
  DAOABovinValidatedSubPlanFixture,
  DAOAVolailleValidatedSubPlanFixture,
  NationalCoordinatorAlanId,
  PPVValidatedSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  AdminBGIRFixture,
  AdminFixture,
  NationalCoordinator,
  NationalCoordinatorDaoaFixture,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { UserCompanies, Users } from '../../../repositories/userRepository';
import { AVIVOL, CHARAL } from './001-companies';

const ppvStages = stagesFromSubPlans([PPVValidatedSubPlanFixture]);
const sachaStages = stagesFromSubPlans([
  DAOAVolailleValidatedSubPlanFixture,
  DAOABovinValidatedSubPlanFixture
]);
const alanStages = stagesFromSubPlans([
  ALANRuminantsSubPlanFixture,
  ALANVolaillesSubPlanFixture
]);

export const seed = async () => {
  await Users().insert([
    {
      id: AdminFixture.id,
      email: 'admin@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: [],
      certified: true,
      roles: ['AdministratorMaestro']
    },
    {
      id: AdminBGIRFixture.id,
      email: 'admin.bgir@maestro.beta.gouv.fr',
      name: `BGIR - ${fakerFR.person.fullName()}`,
      stages: [],
      certified: true,
      roles: ['AdministratorBGIR']
    },
    {
      id: crypto.randomUUID(),
      email: 'laboratory@maestro.beta.gouv.fr',
      name: `Laboratoire - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['LaboratoryUser'],
      laboratoryId: CER30Id
    },
    {
      id: crypto.randomUUID(),
      email: 'bureau.laboratoires@maestro.beta.gouv.fr',
      name: `Bureau des laboratoires - ${fakerFR.person.fullName()}`,
      stages: [],
      certified: true,
      roles: ['LaboratoryOffice']
    },

    //PPV
    {
      id: NationalCoordinator.id,
      email: 'coordinateur.national@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: [],
      certified: true,
      roles: ['NationalCoordinator']
    },
    {
      id: crypto.randomUUID(),
      email: 'coordinateur.regional@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['RegionalCoordinator'],
      region: '44'
    },
    {
      id: crypto.randomUUID(),
      email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['RegionalCoordinator'],
      region: '01'
    },
    {
      id: crypto.randomUUID(),
      email: 'preleveur@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['Sampler'],
      region: '44'
    },
    {
      id: crypto.randomUUID(),
      email: 'preleveur.drom@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['Sampler'],
      region: '01'
    },
    {
      id: crypto.randomUUID(),
      email: 'suivi.national@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['NationalObserver']
    },
    {
      id: crypto.randomUUID(),
      email: 'suivi.regional@maestro.beta.gouv.fr',
      name: `PPV - ${fakerFR.person.fullName()}`,
      stages: ppvStages,
      certified: true,
      roles: ['RegionalObserver'],
      region: '44'
    },

    //DAOA
    {
      id: NationalCoordinatorDaoaFixture.id,
      email: 'coordinateur.national.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      stages: [],
      certified: true,
      roles: ['NationalCoordinator']
    },
    {
      id: crypto.randomUUID(),
      email: 'coordinateur.regional.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      stages: sachaStages,
      certified: true,
      roles: ['RegionalCoordinator'],
      region: '52'
    },
    {
      id: crypto.randomUUID(),
      email: 'coordinateur.departemental.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      stages: sachaStages,
      certified: true,
      roles: ['DepartmentalCoordinator'],
      region: '52',
      department: '85'
    },
    {
      id: SamplerDaoaFixture.id,
      email: 'preleveur.daoa@maestro.beta.gouv.fr',
      name: `DAOA - ${fakerFR.person.fullName()}`,
      stages: sachaStages,
      certified: true,
      roles: ['Sampler'],
      region: '52',
      department: '85'
    },

    //ALAN
    {
      id: NationalCoordinatorAlanId,
      email: 'coordinateur.national.alan@maestro.beta.gouv.fr',
      name: `ALAN - ${fakerFR.person.fullName()}`,
      stages: [],
      certified: true,
      roles: ['NationalCoordinator']
    },
    {
      id: crypto.randomUUID(),
      email: 'coordinateur.regional.alan@maestro.beta.gouv.fr',
      name: `ALAN - ${fakerFR.person.fullName()}`,
      stages: alanStages,
      certified: true,
      roles: ['RegionalCoordinator'],
      region: '53'
    },
    {
      id: crypto.randomUUID(),
      email: 'coordinateur.departemental.alan@maestro.beta.gouv.fr',
      name: `ALAN - ${fakerFR.person.fullName()}`,
      stages: alanStages,
      certified: true,
      roles: ['DepartmentalCoordinator'],
      region: '53',
      department: '35'
    },
    {
      id: crypto.randomUUID(),
      email: 'preleveur.alan@maestro.beta.gouv.fr',
      name: `ALAN - ${fakerFR.person.fullName()}`,
      stages: alanStages,
      certified: true,
      roles: ['Sampler'],
      region: '53',
      department: '35'
    },
    {
      id: crypto.randomUUID(),
      email: 'suivi.regional.alan@maestro.beta.gouv.fr',
      name: `ALAN - ${fakerFR.person.fullName()}`,
      stages: alanStages,
      certified: true,
      roles: ['RegionalObserver'],
      region: '53'
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
