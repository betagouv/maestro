import type { Meta, StoryObj } from '@storybook/react';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { expect, fireEvent, userEvent, within } from '@storybook/test';
import clsx from 'clsx';
import { ResultKindList } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { v4 as uuidv4 } from 'uuid';
import { mockApiClient } from '../../../../services/mockApiClient';
import { SampleAnalysisReview } from './SampleAnalysisReview';
import { genNumber, oneOf } from 'maestro-shared/test/testFixtures';
import { AnalysisMethodList } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { ResidueKindList } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';

const meta = {
  title: 'Views/SampleAnalysisReview',
  component: SampleAnalysisReview,
  args: {
    sample: Sample11Fixture as Sample
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
} satisfies Meta<typeof SampleAnalysisReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReviewWithoutResidue: Story = {
  args: {
    partialAnalysis: {
      id: uuidv4(),
      reportDocumentId: uuidv4(),
      residues: []
    },
    apiClient: mockApiClient
  }
};

export const ReviewWithResidues: Story = {
  args: {
    ...ReviewWithoutResidue.args,
    partialAnalysis: {
      id: uuidv4(),
      reportDocumentId: uuidv4(),
      residues: [{
        analysisId: uuidv4(),
        residueNumber: 1,
        analysisMethod: 'Mono',
        kind: 'Simple',
        result: 2,
        resultKind: 'Q',
        lmr: 3
      }]
    },
  }
};

export const Interpretation: Story = {
  args: {
    ...ReviewWithoutResidue.args,
    initialReviewState: 'Interpretation'
  }
};

export const CorrectionWithoutResidu: Story = {
  args: {
    ...ReviewWithoutResidue.args,
    initialReviewState: 'Correction'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('checkbox'));
    await userEvent.click(canvas.getByLabelText('mono-résidu'));
    await userEvent.click(canvas.getByLabelText('Simple'));

    //FIXME extract select autocomplete
    const autocomplete = canvas.getByText(
      'Résidu selon définition'
    ).parentElement!;
    const input = within(autocomplete).getByRole('combobox');
    await userEvent.click(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });

    const kindFieldset = canvas.getByText(
      "Type de résultat de l'analyse"
    ).parentElement!;
    const kindSelect = within(kindFieldset).getByRole('combobox');
    await userEvent.selectOptions(kindSelect, ResultKindList[0]);


    await userEvent.type(canvas.getByLabelText(/Valeur numérique du résultat/), '2')
    await userEvent.type(canvas.getByLabelText(/Valeur de la LMR/), '3')

    await userEvent.click(canvas.getByLabelText('Conforme'));

    // await userEvent.click(canvas.getByText('Continuer'));

    //FIXME Jerôme il n'y a pas de <form/> ?
    // await expect(
    //   canvas.getByText("Valider les données et l'interprétation")
    // ).not.toBeInTheDocument();
  }
};

//FIXME Jerôme si on ne remplit pas le résultat on peut quand même passer à l'étape d'après
// export const CorrectionWithRequiredResult: Story = {
//   args: {
//     ...ReviewWithoutResidu.args,
//     initialReviewState: 'Correction'
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//
//     await userEvent.click(canvas.getByRole('checkbox'));
//     await userEvent.click(canvas.getByLabelText('mono-résidu'));
//     await userEvent.click(canvas.getByLabelText('Simple'));
//
//     //FIXME extract select autocomplete
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
//       canvas.getByText("Valider les données et l'interprétation")
//     ).not.toBeInTheDocument();
//   }
// };
