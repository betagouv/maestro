import type { Meta, StoryObj } from '@storybook/react-vite';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import {
  genPartialAnalysis,
  genPartialAnalyte,
  genPartialResidue
} from 'maestro-shared/test/analysisFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { SampleAnalysisOverview } from '../SampleAnalysisOverview/SampleAnalysisOverview';

const meta = {
  title: 'Views/SampleAnalysisOverview',
  component: SampleAnalysisOverview,
  args: {
    sample: Sample11Fixture as SampleChecked,
    analysis: genPartialAnalysis({
      compliance: true,
      notesOnCompliance: 'Super conforme, cool !!!',
      residues: [
        genPartialResidue({
          reference: 'RF-00000010-MCG',
          residueNumber: 1,
          compliance: 'Compliant',
          resultKind: 'Q',
          result: 3.23,
          lmr: 5,
          resultHigherThanArfd: 'true'
        }),
        genPartialResidue({
          reference: 'RF-0034-001-PPP',
          residueNumber: 2,
          compliance: 'Compliant',
          resultKind: 'NQ',
          analytes: [
            genPartialAnalyte({
              reference: 'RF-0034-002-PPP',
              analyteNumber: 1,
              resultKind: 'NQ'
            }),
            genPartialAnalyte({
              reference: 'RF-0034-003-PPP',
              analyteNumber: 2,
              resultKind: 'Q',
              result: 3
            })
          ]
        }),
        genPartialResidue({
          reference: 'RF-1057-001-PPP',
          residueNumber: 3,
          compliance: 'NonCompliant',
          result: 5,
          resultKind: 'Q',
          lmr: 3,
          notesOnPollutionRisk: 'peut-être un risque de pollution'
        }),
        genPartialResidue({
          reference: 'RF-00000012-PAR',
          residueNumber: 4,
          compliance: 'Other',
          resultKind: 'NQ',
          otherCompliance: "c'est presque conforme mais c'est pas Non conforme"
        })
      ]
    }) as Analysis,
    readonly: true,
    onEdit: () => ({})
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    }
  },
  decorators: [
    (Story) => (
      <div className={clsx(cx('fr-container'))}>
        <div className={clsx('analysis-container')}>
          <Story />
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof SampleAnalysisOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
