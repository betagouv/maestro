import type { Meta, StoryObj } from '@storybook/react';

import { SampleAnalysisReview } from './SampleAnalysisReview';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sample } from 'maestro-shared/schema/Sample/Sample';

const meta: Meta<typeof SampleAnalysisReview> = {
  title: 'Views/SampleAnalysisReview',
  component: SampleAnalysisReview,
};

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    sample: Sample11Fixture as Sample
  }
};

