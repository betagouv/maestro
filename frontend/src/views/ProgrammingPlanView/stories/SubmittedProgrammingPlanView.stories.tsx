import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import {
  genPrescription,
  genRegionalPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genRegionalPrescriptionComment } from 'maestro-shared/test/regionalPrescriptionCommentFixture';
import {
  genAuthUser,
  NationalCoordinator,
  RegionalCoordinator
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { AuthenticatedAppRoutes } from '../../../AppRoutes';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingPlanView from '../ProgrammingPlanView';

const meta = {
  title: 'Views/ProgrammingPlanView/SubmittedProgrammingPlan',
  component: ProgrammingPlanView
} satisfies Meta<typeof ProgrammingPlanView>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Submitted'
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
const prescription3 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A00FX'
});

const mockApiClient = getMockApi({
  useFindPrescriptionsQuery: {
    data: [prescription1, prescription2, prescription3]
  },
  useFindRegionalPrescriptionsQuery: {
    data: RegionList.flatMap((region) => [
      genRegionalPrescription({
        prescriptionId: prescription1.id,
        region,
        comments:
          region === RegionalCoordinator.region
            ? [
                genRegionalPrescriptionComment({
                  prescriptionId: prescription1.id,
                  region,
                  createdBy: RegionalCoordinator.id
                }),
                genRegionalPrescriptionComment({
                  prescriptionId: prescription1.id,
                  region,
                  createdBy: NationalCoordinator.id
                })
              ]
            : []
      }),
      genRegionalPrescription({
        prescriptionId: prescription2.id,
        region,
        comments:
          region === RegionalCoordinator.region
            ? [
                genRegionalPrescriptionComment({
                  prescriptionId: prescription2.id,
                  region,
                  createdBy: RegionalCoordinator.id
                })
              ]
            : []
      }),
      genRegionalPrescription({
        prescriptionId: prescription3.id,
        region
      })
    ])
  }
});

export const ForNationalCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) },
      programmingPlan: { programmingPlan }
    },
    initialEntries: [
      `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}/?context=Control`
    ],
    apiClient: mockApiClient
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

export const ForRegionalCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(RegionalCoordinator) },
      programmingPlan: { programmingPlan }
    },
    initialEntries: [
      `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}/?context=Control`
    ],
    apiClient: mockApiClient
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

    const card1 = canvas.getByTestId(`card-${prescription1.matrixKind}`);
    await expect(card1).toBeInTheDocument();
    await expect(within(card1).getByText('2 commentaires')).toBeInTheDocument();

    const card2 = canvas.getByTestId(`card-${prescription2.matrixKind}`);
    await expect(card2).toBeInTheDocument();
    await expect(within(card2).getByText('1 commentaire')).toBeInTheDocument();

    const card3 = canvas.getByTestId(`card-${prescription3.matrixKind}`);
    await expect(card3).toBeInTheDocument();
    await expect(
      within(card3).getByText('Échanger avec le coordinateur national')
    ).toBeInTheDocument();

    await userEvent.click(
      within(card3).getByText('Échanger avec le coordinateur national')
    );
    const commentModal = canvas.getByTestId('prescription-comments-modal');
    await expect(commentModal).toBeInTheDocument();
  }
};
