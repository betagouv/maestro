import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import {
  FoieDeBovinPrescriptionFixture,
  FoieDeBovinRegionalPrescriptionFixture,
  VolaillePrescriptionFixture,
  VolailleRegionalPrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { AuthenticatedAppRoutes } from '../../../AppRoutes';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingView from '../ProgrammingView';

const meta = {
  title: 'Views/ProgrammingPlanView/DAOA',
  component: ProgrammingView
} satisfies Meta<typeof ProgrammingView>;

export default meta;
type Story = StoryObj<typeof meta>;

const inProgressProgrammingPlan = DAOAInProgressProgrammingPlanFixture;

const prescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture
];

const regionalPrescriptions = [
  ...FoieDeBovinRegionalPrescriptionFixture,
  ...VolailleRegionalPrescriptionFixture
];

export const NationalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    initialEntries: [
      `${AuthenticatedAppRoutes.SamplesByYearRoute.link(inProgressProgrammingPlan.year)}/?context=Control`
    ],
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [inProgressProgrammingPlan]
      },
      useFindPrescriptionsQuery: { data: prescriptions },
      useFindRegionalPrescriptionsQuery: {
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
      canvas.getByTestId(`matrix-${FoieDeBovinPrescriptionFixture.matrixKind}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId(`matrix-${VolaillePrescriptionFixture.matrixKind}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByTestId(`cell-${FoieDeBovinPrescriptionFixture.matrixKind}`)
    ).toHaveLength(RegionList.length);

    await expect(canvas.getByTestId('add-matrix-button')).toBeInTheDocument();
  }
};
//
// export const RegionalCoordinatorView: Story = {
//   parameters: {
//     preloadedState: {
//       auth: { authUser: genAuthUser(RegionalCoordinator) }
//     },
//     initialEntries: [
//       `${AuthenticatedAppRoutes.ProgrammingRoute.link}?year=${inProgressProgrammingPlan.year}`
//     ],
//     apiClient: getMockApi({
//       useFindProgrammingPlansQuery: { data: [inProgressProgrammingPlan] },
//       useFindPrescriptionsQuery: {
//         data: prescriptions
//       },
//       useFindRegionalPrescriptionsQuery: {
//         data: regionalPrescriptions
//       }
//     })
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//
//     await expect(
//       canvas.queryByTestId('prescriptions-cards-segment')
//     ).not.toBeInTheDocument();
//     await expect(
//       canvas.queryByTestId('prescriptions-table-segment')
//     ).not.toBeInTheDocument();
//
//     await expect(
//       canvas.queryByTestId('add-matrix-button')
//     ).not.toBeInTheDocument();
//   }
// };
