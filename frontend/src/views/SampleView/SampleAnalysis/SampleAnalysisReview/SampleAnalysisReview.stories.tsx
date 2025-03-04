import type { Meta, StoryObj } from '@storybook/react';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
import { mockApiClient } from '../../../../services/mockApiClient';
import { SampleAnalysisReview } from './SampleAnalysisReview';

const meta = {
  title: 'Views/SampleAnalysisReview',
  component: SampleAnalysisReview,
  args: {
    sample: Sample11Fixture as Sample,
  },
  decorators: [
    (Story) => (
      <div
        className={clsx(
          cx(
            'fr-callout',
            'fr-callout--green-emeraude'
          ),
          'sample-callout',
          'analysis-container',
          'fr-mt-5w',
        )}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof SampleAnalysisReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewWithoutResidu: Story = {
  args: {
    partialAnalysis: {
      id: uuidv4(),
      reportDocumentId: uuidv4(),
      residues: []
    },
    apiClient: mockApiClient
  }
};

export const Interpretation: Story = {
  args: {
    ...ReviewWithoutResidu.args,
    initialReviewState: 'Interpretation'
  }
};

export const CorrectionWithoutResidu: Story = {
  args: {
    ...ReviewWithoutResidu.args,
    initialReviewState: 'Correction'
  }
};
