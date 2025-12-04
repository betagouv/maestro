import type { Meta, StoryObj } from '@storybook/react-vite';

import { genPartialAnalysis } from 'maestro-shared/test/analysisFixtures';
import { getMockApi } from '../../../../services/mockApiClient';
import { AnalysisDocumentPreview } from './AnalysisDocumentPreview';

const meta = {
  title: 'Views/AnalysisDocumentPreview',
  component: AnalysisDocumentPreview,
  args: {
    partialAnalysis: genPartialAnalysis({}),
    sampleId: 'fakeAnalysisId',
    readonly: true
  }
} satisfies Meta<typeof AnalysisDocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotReadonly: Story = {
  args: {
    readonly: false
  }
};

export const WithHistory: Story = {
  parameters: {
    apiClient: getMockApi({
      useGetAnalysisReportDocumentIdsQuery: {
        data: ['document1Id', 'document2Id', 'document3Id']
      }
    })
  }
};
