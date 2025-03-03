import type { Meta, StoryObj } from '@storybook/react';

import { Props, SampleAnalysisReview } from './SampleAnalysisReview';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { mockApiClient } from '../../../../services/mockApiClient';
import { fn } from '@storybook/test';

const onCorrectAnalysis: Props['onCorrectAnalysis'] = fn()
const onValidateAnalysis: Props['onValidateAnalysis'] = fn()

const meta = {
  title: 'Views/SampleAnalysisReview',
  component: SampleAnalysisReview,
  args: {
    onCorrectAnalysis,
    onValidateAnalysis
  }
} satisfies  Meta<typeof SampleAnalysisReview> ;

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    sample: Sample11Fixture as Sample,
    analysis: {
      reportDocumentId: 'fakeReportDocument'
    },
   apiClient: mockApiClient
  }
};

