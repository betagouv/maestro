import type { Meta, StoryObj } from '@storybook/react-vite';

import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { getMockApi } from '../../../services/mockApiClient';
import SampleAnalysis from './SampleAnalysis';

import { fn } from 'storybook/test';
import '../SampleOverview/SampleOverview.scss';

const meta = {
  title: 'Views/SampleAnalysis',
  component: SampleAnalysis,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof SampleAnalysis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewWithoutResidu: Story = {
  args: {
    sample: {
      ...Sample11Fixture,
      status: 'Analysis',
      receivedAt: new Date(12345)
    } as SampleChecked
  },
  parameters: {
    apiClient: getMockApi({
      useUpdateSampleMutation: [async () => fn(), { isSuccess: false }]
    })
  }
};
