import type { Meta, StoryObj } from '@storybook/react';

import { expect, within } from '@storybook/test';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
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

const meta = {
  title: 'Views/MatrixStep',
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
  role: 'Sampler'
});
const programmingPlan = genProgrammingPlan({
  kinds: ['PFAS_EGGS', 'PFAS_MEAT']
});
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A031E',
  stages: ['STADE11']
});

export const MatrixStepPFAS: Story = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        specificData: {
          programmingPlanKind: 'PFAS_EGGS'
        }
      }),
      ...genCreatedSampleData({ sampler })
    }
  },
  parameters: {
    preloadedState: {
      programmingPlan: {
        programmingPlan
      },
      auth: { authUser: genAuthUser(sampler) }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindPrescriptionsQuery: {
        data: [prescription1]
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByTestId('species-select')).toHaveLength(2);
    await expect(canvas.getAllByTestId('matrix-kind-select')).toHaveLength(1);
    await expect(canvas.getAllByTestId('matrix-select')).toHaveLength(1);
    await expect(canvas.getAllByTestId('stage-select')).toHaveLength(2);
    await expect(canvas.getAllByTestId('notes-input')).toHaveLength(2);

    await expect(canvas.getByTestId('previous-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('save-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('submit-button')).toBeInTheDocument();
  }
};
