import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DAOABovinValidatedSubPlanFixture,
  DAOABovinValidatedSubPlanId,
  genProgrammingPlan
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { DAOABovinFieldConfigs } from 'maestro-shared/test/specificDataFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { getMockApi } from '../../../../../services/mockApiClient';
import MatrixStep from '../MatrixStep';

const meta = {
  title: 'Views/SampleView/MatrixStep',
  component: MatrixStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof MatrixStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampler = genUser({
  roles: ['Sampler'],
  region: '44',
  programmingSubPlanIds: [DAOABovinValidatedSubPlanId]
});
const programmingPlan = genProgrammingPlan({
  subPlans: [DAOABovinValidatedSubPlanFixture],
  distributionKind: 'SLAUGHTERHOUSE'
});

export const MatrixStepDAOA: Story = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        sampler,
        specificData: {},
        programmingSubPlanId: DAOABovinValidatedSubPlanId
      }),
      ...genCreatedSampleData()
    }
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(sampler) },
      programmingPlan: {
        programmingPlan
      }
    },
    apiClient: getMockApi({
      useFindProgrammingSubPlanFieldConfigsQuery: {
        data: DAOABovinFieldConfigs
      }
    })
  }
};
