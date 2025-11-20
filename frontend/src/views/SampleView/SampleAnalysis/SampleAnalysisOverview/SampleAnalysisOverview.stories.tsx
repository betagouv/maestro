import type { Meta, StoryObj } from '@storybook/react-vite';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import {
  genPartialAnalysis,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { SampleAnalysisOverview } from '../SampleAnalysisOverview/SampleAnalysisOverview';

const meta = {
  title: 'Views/SampleAnalysisOverview',
  component: SampleAnalysisOverview,
  args: {
    sample: Sample11Fixture as Sample,
    analysis: genPartialAnalysis({
      residues: [genPartialResidue()]
    }) as Analysis
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    }
  },
  decorators: [
    (Story) => (
      <div className={clsx(cx('fr-container'))}>
        <div
          className={clsx(
            cx('fr-callout', 'fr-callout--green-emeraude'),
            'sample-callout',
            'analysis-container',
            'fr-mx-5w'
          )}
        >
          <Story />
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof SampleAnalysisOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
