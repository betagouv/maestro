import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import {
  genPrescription,
  genRegionalPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genCreatedPartialSample } from 'maestro-shared/test/sampleFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { ApiClient } from '../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../services/mockApiClient';
import ProgrammingPlanView from './ProgrammingPlanView';

const meta = {
  title: 'Views/ProgrammingPlanView',
  component: ProgrammingPlanView
} satisfies Meta<typeof ProgrammingPlanView>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = {
  ...genProgrammingPlan(),
  status: 'InProgress',
  statusDrom: 'InProgress'
};
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control'
});
const prescription2 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control'
});
const sample = genCreatedPartialSample({
  sampler: Sampler1Fixture,
  programmingPlanId: programmingPlan.id,
  context: 'Control'
});

export const ProgrammingPlanViewForNationalCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) },
      programmingPlan: { programmingPlan }
    },
    initialEntries: [
      `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}/?context=Control`
    ],
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useGetSampleQuery: { data: sample },
      useFindProgrammingPlansQuery: { data: [programmingPlan] },
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindRegionalPrescriptionsQuery: {
        data: RegionList.flatMap((region) => [
          genRegionalPrescription({
            prescriptionId: prescription1.id,
            region
          }),
          genRegionalPrescription({
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
