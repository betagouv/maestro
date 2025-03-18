import type { Meta, StoryObj } from '@storybook/react';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { expect, fn, userEvent, within } from '@storybook/test';
import clsx from 'clsx';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
import { SampleAnalysisReview } from './SampleAnalysisReview';

const onReviewDoneMock = fn()
const meta = {
  title: 'Views/SampleAnalysisReview',
  component: SampleAnalysisReview,
  args: {
    sample: Sample11Fixture as Sample,
    onReviewDone: onReviewDoneMock
  },
  decorators: [
    (Story) => (
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
    )
  ]
  ,
  async beforeEach() {
    return () => {
      onReviewDoneMock.mockReset()
    };
  },
} satisfies Meta<typeof SampleAnalysisReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewWithoutResidue: Story = {
  args: {
    partialAnalysis: {
      id: uuidv4(),
      status: 'Residues',
      createdAt: new Date(1234),
      sampleId: uuidv4(),
      reportDocumentId: uuidv4(),
      createdBy: null,
      residues: []
    }
  }
};

export const ReviewWithResidues: Story = {
  args: {
    partialAnalysis: {
      id: uuidv4(),
      status: 'Residues',
      createdAt: new Date(1234),
      sampleId: uuidv4(),
      reportDocumentId: uuidv4(),
      createdBy: null,
      residues: [
        {
          analysisId: uuidv4(),
          residueNumber: 1,
          reference: 'RF-0001-001-PPP',
          analysisMethod: 'Mono',
          kind: 'Simple',
          result: 2,
          resultKind: 'Q',
          lmr: 3
        },
        {
          analysisId: uuidv4(),
          residueNumber: 2,
          reference: 'RF-00003351-PAR',
          analysisMethod: 'Multi',
          kind: 'Complex',
          result: null,
          resultKind: 'NQ',
          lmr: null,
          analytes: [
            {
              analysisId: uuidv4(),
              residueNumber: 2,
              analyteNumber: 1,
              reference: 'RF-0016-002-PPP',
              resultKind: 'NQ',
              result: null
            }
          ]
        }
      ]
    }
  }
};

export const Interpretation = {
  args: {
    ...ReviewWithResidues.args
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const conformeButton of canvas.getAllByText('Conforme')) {
      await userEvent.click(conformeButton);
    }
    await userEvent.click(canvas.getByText("Finaliser l'interprétation"));

    await userEvent.click(canvas.getByLabelText('Échantillon conforme'));
    await userEvent.click(canvas.getByText("Valider l'interprétation"));
    await expect(meta.args.onReviewDone).toBeCalled();
  }
} satisfies Story;

export const CorrectionWithResidues = {
  args: {
    ...ReviewWithResidues.args
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Corriger'));

    const firstResiduContainer = within(canvas.getByText('Résidu n°1').parentElement!.parentElement!)

    await expect(firstResiduContainer.getByText('Type de résidu')).toBeInTheDocument();
    await expect(meta.args.onReviewDone).not.toBeCalled();
  }
} satisfies Story;

export const CorrectionWithoutResidu: Story = {
  args: {
    ...ReviewWithoutResidue.args
  },
  play: async (context) => {
    const {canvas} = context
    await CorrectionWithResidues.play(context);
    await userEvent.click(canvas.getByTitle('Retour'))

    await expect(canvas.queryByText('Résidu n°1')).not.toBeInTheDocument()
  }
};

//TODO si on ne remplit pas le résultat on peut quand même passer à l'étape d'après
// export const CorrectionWithRequiredResult: Story = {
//   args: {
//     ...CorrectionWithoutResidu.args,
//   },
//   play: async (context) => {
//     await CorrectionWithResidues.play(context);
//
//     const canvas = within(context.canvasElement);
//
//     await userEvent.click(canvas.getByLabelText('mono-résidu'));
//     await userEvent.click(canvas.getByLabelText('Simple'));
//
//     const autocomplete = canvas.getByText(
//       'Résidu selon définition'
//     ).parentElement!;
//     const input = within(autocomplete).getByRole('combobox');
//     await userEvent.click(input);
//     await fireEvent.keyDown(input, { key: 'ArrowDown' });
//     await fireEvent.keyDown(input, { key: 'Enter' });
//
//     const kindFieldset = canvas.getByText(
//       "Type de résultat de l'analyse"
//     ).parentElement!;
//     const kindSelect = within(kindFieldset).getByRole('combobox');
//     await userEvent.selectOptions(kindSelect, ResultKindList[0]);
//
//     await userEvent.click(canvas.getByLabelText('Conforme'));
//
//     await userEvent.click(canvas.getByText('Continuer'));
//
//     await expect(
//       canvas.getByText("Finaliser l'interprétation")
//     ).not.toBeInTheDocument();
//   }
// };
