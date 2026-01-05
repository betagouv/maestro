import type { Meta, StoryObj } from '@storybook/react-vite';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  Region1Fixture,
  RegionalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import DashboardView from './DashboardView';

const meta = {
  title: 'Views/DashboardView',
  component: DashboardView,
  args: { onSelect: fn() }
} satisfies Meta<typeof DashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

const currentProgrammingPlan = genProgrammingPlan({
  year: new Date().getFullYear(),
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'InProgress'
  })),
  contexts: ['Control', 'Surveillance']
});
const previousProgrammingPlan = genProgrammingPlan({
  year: new Date().getFullYear() - 1,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  contexts: ['Control', 'Surveillance']
});

const prescription1 = genPrescription({
  programmingPlanId: currentProgrammingPlan.id,
  context: 'Control',
  matrixKind: 'A0DEH'
});
const prescription2 = genPrescription({
  programmingPlanId: currentProgrammingPlan.id,
  context: 'Control',
  matrixKind: 'A0DQS'
});

export const DashboardViewForSampler: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'Sampler',
          region: Region1Fixture,
          id: Sampler1Fixture.id
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [previousProgrammingPlan, currentProgrammingPlan]
      },
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindLocalPrescriptionsQuery: {
        data: [
          genLocalPrescription({
            prescriptionId: prescription1.id,
            region: RegionalCoordinator.region as Region
          }),
          genLocalPrescription({
            prescriptionId: prescription2.id,
            region: RegionalCoordinator.region as Region
          })
        ]
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(
      canvas.getByText(`Plan de contrôle ${new Date().getFullYear()}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(`Plan de surveillance ${new Date().getFullYear()}`)
    ).toBeInTheDocument();
  }
};

export const DashboardViewForRegionalCoordinator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'RegionalCoordinator',
          id: RegionalCoordinator.id
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [previousProgrammingPlan, currentProgrammingPlan]
      },
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindLocalPrescriptionsQuery: {
        data: [
          genLocalPrescription({
            prescriptionId: prescription1.id,
            region: RegionalCoordinator.region as Region
          }),
          genLocalPrescription({
            prescriptionId: prescription2.id,
            region: RegionalCoordinator.region as Region
          })
        ]
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(
      canvas.getByText(`Plan de contrôle ${new Date().getFullYear()}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(`Plan de surveillance ${new Date().getFullYear()}`)
    ).toBeInTheDocument();

    await expect(
      canvas.queryByTestId('close-programming-plan-button')
    ).not.toBeInTheDocument();
  }
};

export const DashboardViewForNationalCoordinator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'NationalCoordinator',
          id: NationalCoordinator.id
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [previousProgrammingPlan, currentProgrammingPlan]
      },
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindLocalPrescriptionsQuery: {
        data: RegionList.flatMap((region) => [
          genLocalPrescription({
            prescriptionId: prescription1.id,
            region
          }),
          genLocalPrescription({
            prescriptionId: prescription2.id,
            region
          })
        ])
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(canvas.getByText(`Plan de contrôle`)).toBeInTheDocument();
    await expect(canvas.getByText(`Plan de surveillance`)).toBeInTheDocument();

    await expect(
      canvas.getByText(
        `Clôturer la programmation ${new Date().getFullYear() - 1}`
      )
    ).toBeInTheDocument();
  }
};

export const DashboardViewForNationalCoordinatorNoCurrentProgrammingPlan: Story =
  {
    args: {
      id: 'id',
      filters: {}
    },
    parameters: {
      preloadedState: {
        auth: {
          authUser: genAuthUser({
            userRole: 'NationalCoordinator',
            id: NationalCoordinator.id
          })
        }
      },
      apiClient: getMockApi({
        useFindProgrammingPlansQuery: ({
          status
        }: FindProgrammingPlanOptions) => ({
          data: status?.length
            ? []
            : [
                genProgrammingPlan({
                  year: new Date().getFullYear() - 1,
                  regionalStatus: RegionList.map((region) => ({
                    region,
                    status: 'Validated'
                  })),
                  contexts: ['Control', 'Surveillance']
                })
              ]
        })
      })
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
      await expect(canvas.getByText(`Plan de contrôle`)).toBeInTheDocument();
      await expect(
        canvas.getByText(`Plan de surveillance`)
      ).toBeInTheDocument();

      await expect(
        canvas.getByText('Créer la programmation 2026')
      ).toBeInTheDocument();
    }
  };
