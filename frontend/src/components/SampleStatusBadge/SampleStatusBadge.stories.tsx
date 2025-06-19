import type { Meta, StoryObj } from '@storybook/react-vite';
import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { ApiClient } from '../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../services/mockApiClient';
import { SampleStatusBadge } from './SampleStatusBadge';

const meta = {
  title: 'Components/SampleStatusBadge',
  component: SampleStatusBadge
} satisfies Meta<typeof SampleStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: {
    status: 'Draft',
    sampleId: ''
  }
};

export const CompletedConform: Story = {
  args: {
    status: 'Completed',
    sampleId: ''
  },
  parameters: {
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useLazyGetSampleAnalysisQuery: genPartialAnalysis({ compliance: true })
    })
  }
};
export const CompletedNonConform: Story = {
  args: CompletedConform.args,
  parameters: {
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useLazyGetSampleAnalysisQuery: genPartialAnalysis({ compliance: false })
    })
  }
};
