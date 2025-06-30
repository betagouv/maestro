import type { Meta, StoryObj } from '@storybook/react-vite';

import { ApiClient } from '../../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../../services/mockApiClient';
import { AnalysisDocumentPreview } from './AnalysisDocumentPreview';

const meta = {
  title: 'Views/AnalysisDocumentPreview',
  component: AnalysisDocumentPreview,
  args: {
    analysisId: 'fakeAnalysisId',
    sampleId: 'fakeAnalysisId',
    readonly: false
  }
} satisfies Meta<typeof AnalysisDocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Readonly: Story = {
  args: {
    readonly: true,
    onClickButton: () => {}
  }
};

export const WithHistory: Story = {
  parameters: {
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useGetAnalysisReportDocumentIdsQuery: {
        data: ['document1Id', 'document2Id', 'document3Id']
      }
    })
  }
};
