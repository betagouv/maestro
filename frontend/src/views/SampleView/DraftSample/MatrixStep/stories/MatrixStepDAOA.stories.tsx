import type { Meta, StoryObj } from '@storybook/react-vite';

import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
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
  programmingPlanKinds: ['DAOA_SLAUGHTER']
});
const programmingPlan = genProgrammingPlan({
  kinds: ['DAOA_SLAUGHTER'],
  distributionKind: 'SLAUGHTERHOUSE'
});

export const MatrixStepDAOA: Story = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        sampler,
        specificData: {
          programmingPlanKind: 'DAOA_SLAUGHTER'
        }
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
    }
  }
};
