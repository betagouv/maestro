import { fakerFR } from '@faker-js/faker';
import { omit } from 'lodash-es';
import { NationalCoordinator } from 'maestro-shared/test/userFixtures';
import { v4 as uuidv4 } from 'uuid';
import { Users } from '../../../repositories/userRepository';

export const seed = async function () {
  await Users().insert(
    [
      {
        id: uuidv4(),
        email: 'admin@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: [],
        role: 'Administrator'
      },

      //PPV
      {
        id: NationalCoordinator.id,
        email: 'coordinateur.national@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'NationalCoordinator'
      },
      {
        id: uuidv4(),
        email: 'coordinateur.regional@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'RegionalCoordinator',
        region: '44'
      },
      {
        id: uuidv4(),
        email: 'coordinateur.regional.drom@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'RegionalCoordinator',
        region: '01'
      },
      {
        id: uuidv4(),
        email: 'preleveur@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'Sampler',
        region: '44'
      },
      {
        id: uuidv4(),
        email: 'preleveur.drom@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'Sampler',
        region: '01'
      },
      {
        id: uuidv4(),
        email: 'suivi.national@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'NationalObserver'
      },
      {
        id: uuidv4(),
        email: 'suivi.regional@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'RegionalObserver',
        region: '44'
      },
      {
        id: uuidv4(),
        email: 'preleveur.ressource@maestro.beta.gouv.fr',
        name: `PPV - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PPV'],
        role: 'SamplerAndNationalObserver',
        region: '44'
      },

      //DAOA
      {
        id: uuidv4(),
        email: 'coordinateur.national.daoa@maestro.beta.gouv.fr',
        name: `DAOA - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['DAOA_BREEDING', 'DAOA_SLAUGHTER'],
        role: 'NationalCoordinator'
      },
      {
        id: uuidv4(),
        email: 'coordinateur.regional.daoa@maestro.beta.gouv.fr',
        name: `DAOA - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['DAOA_BREEDING', 'DAOA_SLAUGHTER'],
        role: 'RegionalCoordinator',
        region: '52'
      },
      {
        id: uuidv4(),
        email: 'coordinateur.departemental.daoa@maestro.beta.gouv.fr',
        name: `DAOA - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['DAOA_BREEDING', 'DAOA_SLAUGHTER'],
        role: 'DepartmentalCoordinator',
        region: '52',
        department: '85'
      },
      {
        id: uuidv4(),
        email: 'preleveur.daoa@maestro.beta.gouv.fr',
        name: `DAOA - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['DAOA_BREEDING', 'DAOA_SLAUGHTER'],
        role: 'Sampler',
        region: '52',
        department: '85',
        company: {
          siret: '54695037900273',
          name: 'CHARAL'
        }
      },

      //PFAS
      {
        id: uuidv4(),
        email: 'preleveur-pfas@maestro.beta.gouv.fr',
        name: `PFAS - ${fakerFR.person.fullName()}`,
        programmingPlanKinds: ['PFAS_EGGS', 'PFAS_MEAT'],
        role: 'Sampler',
        region: '84'
      }
    ].map(
      (user) =>
        ({
          ...omit(user, 'company'),
          companySiret: user.company?.siret || null
        }) as any
    )
  );
};
