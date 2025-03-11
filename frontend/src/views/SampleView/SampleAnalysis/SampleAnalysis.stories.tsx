import type { Meta, StoryObj } from '@storybook/react';

import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { defaultMockApiClientConf, getMockApi } from '../../../services/mockApiClient';
import SampleAnalysis from './SampleAnalysis';

import '../SampleOverview/SampleOverview.scss'
import { fn } from '@storybook/test';
import { ApiClient } from '../../../services/apiClient';


const meta = {
  title: 'Views/SampleAnalysis',
  component: SampleAnalysis,
  decorators: (Story) => <div className='sample-overview'><Story/></div>
} satisfies  Meta<typeof SampleAnalysis> ;

export default meta;
type Story = StoryObj<typeof meta>;


export const ReviewWithoutResidu: Story = {
  args: {
    sample: {...Sample11Fixture, status: 'Analysis', receivedAt: new Date(12345)} as Sample,
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useUpdateSampleMutation: [async () => fn(), { isSuccess: false }]
    })
  }
};

