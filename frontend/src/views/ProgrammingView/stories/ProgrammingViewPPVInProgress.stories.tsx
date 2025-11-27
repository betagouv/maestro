import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingView from '../ProgrammingView';

const meta = {
  title: 'Views/ProgrammingPlanView/PPV/1 - InProgress',
  component: ProgrammingView
} satisfies Meta<typeof ProgrammingView>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress'
    }))
  })
};
const pastProgrammingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Validated'
    })),
    year: new Date().getFullYear() - 1
  })
};
const prescription1 = genPrescription({
  programmingPlanId: pastProgrammingPlan.id,
  context: 'Control',
  matrixKind: 'A0DEH'
});
const prescription2 = genPrescription({
  programmingPlanId: pastProgrammingPlan.id,
  context: 'Control',
  matrixKind: 'A0DQS'
});

const programmingPlans = [programmingPlan, pastProgrammingPlan];

const prescriptions = [prescription1, prescription2];

const regionalPrescriptions = [
  ...RegionList.flatMap((region) => [
    genLocalPrescription({
      prescriptionId: prescription1.id,
      region
    }),
    genLocalPrescription({
      prescriptionId: prescription2.id,
      region
    })
  ])
];

export const NationalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: programmingPlans
      },
      useFindPrescriptionsQuery: { data: prescriptions },
      useFindLocalPrescriptionsQuery: {
        data: regionalPrescriptions
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
      canvas.getByTestId(`matrix-${prescription1.id}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId(`matrix-${prescription2.id}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByTestId(`cell-${prescription1.id}`)
    ).toHaveLength(RegionList.length);

    await userEvent.click(canvas.getByTestId('prescriptions-cards-segment'));

    await expect(canvas.getByTestId('add-matrix-button')).toBeInTheDocument();

    await expect(
      canvas.queryByTestId('update-laboratory-button')
    ).not.toBeInTheDocument();

    await expect(canvas.getByTestId('notify-button')).toBeInTheDocument();
  }
};
