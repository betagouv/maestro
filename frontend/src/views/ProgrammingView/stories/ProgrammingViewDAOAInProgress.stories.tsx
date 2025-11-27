import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import {
  FoieDeBovinLocalPrescriptionFixture,
  FoieDeBovinPrescriptionFixture,
  VolailleLocalPrescriptionFixture,
  VolaillePrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingView from '../ProgrammingView';

const meta = {
  title: 'Views/ProgrammingPlanView/DAOA/1 - InProgress',
  component: ProgrammingView
} satisfies Meta<typeof ProgrammingView>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = DAOAInProgressProgrammingPlanFixture;

const prescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture
];

const regionalPrescriptions = [
  ...FoieDeBovinLocalPrescriptionFixture,
  ...VolailleLocalPrescriptionFixture
];

export const NationalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [programmingPlan]
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
      canvas.getByTestId(`matrix-${FoieDeBovinPrescriptionFixture.id}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId(`matrix-${VolaillePrescriptionFixture.id}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByTestId(`cell-${FoieDeBovinPrescriptionFixture.id}`)
    ).toHaveLength(RegionList.length);

    await userEvent.click(canvas.getByTestId('prescriptions-cards-segment'));

    await expect(canvas.getByTestId('add-matrix-button')).toBeInTheDocument();

    await expect(canvas.getByTestId('notify-button')).toBeInTheDocument();
  }
};
