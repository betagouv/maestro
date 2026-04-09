import type { Meta, StoryObj } from '@storybook/react-vite';

import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import {
  Sample1Item1Fixture,
  Sample11Fixture
} from 'maestro-shared/test/sampleFixtures';
import { fn } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import SampleItemAnalysis from './SampleItemAnalysis';
import '../SampleOverview/SampleOverview.scss';

const meta = {
  title: 'Views/SampleItemAnalysis',
  component: SampleItemAnalysis,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof SampleItemAnalysis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewWithoutResidu: Story = {
  args: {
    sample: {
      ...Sample11Fixture,
      status: 'Analysis',
      receivedAt: new Date(12345)
    } as SampleChecked,
    sampleItem: Sample1Item1Fixture
  },
  parameters: {
    apiClient: getMockApi({
      useUpdateSampleMutation: [async () => fn(), { isSuccess: false }]
    })
  }
};
