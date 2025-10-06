import type { Meta, StoryObj } from '@storybook/react-vite';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  RegionalCoordinator
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { AuthenticatedAppRoutes } from '../../../AppRoutes';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingView from '../ProgrammingView';

const meta = {
  title: 'Views/ProgrammingPlanView/PPV',
  component: ProgrammingView
} satisfies Meta<typeof ProgrammingView>;

export default meta;
type Story = StoryObj<typeof meta>;

const inProgressProgrammingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress'
    })),
    year: new Date().getFullYear() - 1
  })
};
const programmingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Validated'
    }))
  })
};
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A0DEH'
});
const prescription2 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A0DQS'
});

export const NationalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    initialEntries: [
      `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}/?context=Control`
    ],
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [inProgressProgrammingPlan, programmingPlan]
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

    await expect(
      canvas.getByTestId('prescriptions-cards-segment')
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId('prescriptions-table-segment')
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('prescriptions-table-segment'));

    await expect(canvas.getByTestId('prescription-table')).toBeInTheDocument();

    await expect(
      canvas.getByTestId(`matrix-${prescription1.matrixKind}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId(`matrix-${prescription2.matrixKind}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByTestId(`cell-${prescription1.matrixKind}`)
    ).toHaveLength(RegionList.length);

    await expect(canvas.getByTestId('add-matrix-button')).toBeInTheDocument();
  }
};

export const RegionalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(RegionalCoordinator) },
      programmingPlan: { programmingPlan }
    },
    initialEntries: [
      `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}/?context=Control`
    ],
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: { data: [programmingPlan] },
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

    await expect(
      canvas.queryByTestId('prescriptions-cards-segment')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByTestId('prescriptions-table-segment')
    ).not.toBeInTheDocument();

    await expect(
      canvas.queryByTestId('add-matrix-button')
    ).not.toBeInTheDocument();
  }
};
