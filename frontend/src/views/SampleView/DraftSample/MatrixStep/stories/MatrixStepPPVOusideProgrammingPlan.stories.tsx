import type { Meta, StoryObj } from '@storybook/react';

import { expect, fn, within } from '@storybook/test';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { ApiClient } from '../../../../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../../../../services/mockApiClient';
import MatrixStep from '../MatrixStep';

const createOrUpdateMock = fn();
const meta = {
  title: 'Views/MatrixStep',
  component: MatrixStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  ),
  async beforeEach() {
    return () => {
      createOrUpdateMock.mockReset();
    };
  }
} satisfies Meta<typeof MatrixStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampler = genUser({
  role: 'Sampler',
  region: '44'
});
const programmingPlan = genProgrammingPlan({
  kinds: ['PPV']
});

const story: Pick<Story, 'args' | 'parameters'> = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        context: 'LocalPlan'
      }),
      ...genCreatedSampleData({ sampler })
    }
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(sampler) },
      programmingPlan: {
        programmingPlan
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf
    })
  }
};

export const MatrixStepPPVOusideProgrammingPlan: Story = {
  ...story,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByTestId('matrix-kind-select')).toHaveLength(1);
    await expect(canvas.getAllByTestId('matrix-select')).toHaveLength(1);
    await expect(canvas.getAllByTestId('stage-select')).toHaveLength(2);
    await expect(canvas.getAllByTestId('matrixdetails-input')).toHaveLength(2);
    await expect(canvas.getAllByTestId('culturekind-select')).toHaveLength(2);
    await expect(canvas.getAllByTestId('matrixpart-select')).toHaveLength(2);
    await expect(
      canvas.getByLabelText('Contrôle libératoire')
    ).toBeInTheDocument();
    await expect(canvas.getAllByTestId('notes-input')).toHaveLength(2);

    await expect(canvas.getByTestId('previous-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('save-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('submit-button')).toBeInTheDocument();
  }
};
