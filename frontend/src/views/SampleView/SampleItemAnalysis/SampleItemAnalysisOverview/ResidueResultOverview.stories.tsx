import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { Meta, StoryObj } from '@storybook/react-vite';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import type { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { genPartialResidue } from 'maestro-shared/test/analysisFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { expect, within } from 'storybook/test';
import { ResidueResultOverview } from './ResidueResultOverview';

const residueWithOptionalLmr = (lmr: number | null): PartialResidue =>
  ({
    ...omit(Sample11Fixture, 'compliance'),
    stage: 'STADE2',
    ...genPartialResidue({
      reference: 'RF-00000010-MCG',
      residueNumber: 1,
      compliance: 'Compliant',
      resultKind: 'Q',
      result: 1,
      lmr
    })
  }) as PartialResidue;

const residueWithRequiredLmr = (result: number, lmr: number): PartialResidue =>
  ({
    ...omit(Sample11Fixture, 'compliance'),
    ...genPartialResidue({
      reference: 'RF-00000010-MCG',
      residueNumber: 1,
      compliance: 'NonCompliant',
      resultKind: 'Q',
      result,
      lmr
    })
  }) as PartialResidue;

const meta = {
  title: 'Views/ResidueResultOverview',
  component: ResidueResultOverview,
  args: {
    programmingPlanKind: 'PPV',
    residue: residueWithOptionalLmr(5)
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
} satisfies Meta<typeof ResidueResultOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LmrDepasseeAvecAlerte: Story = {
  args: {
    residue: residueWithRequiredLmr(5, 3)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Valeur de la LMR')).toBeInTheDocument();
    await expect(
      canvas.getByText(/Résultat brut supérieur à la LMR/)
    ).toBeInTheDocument();
  }
};

export const LmrDepasseeAvecAlerteCorrigee: Story = {
  args: {
    residue: residueWithRequiredLmr(10, 3)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(/Résultat brut supérieur à la LMR/)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Résultat corrigé supérieur à la LMR')
    ).toBeInTheDocument();
  }
};

// LMR optionnelle mais renseignée (non nulle) -> le champ LMR reste visible.
export const LmrOptionnelleAvecValeur: Story = {
  args: {
    residue: residueWithOptionalLmr(5)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Valeur de la LMR')).toBeInTheDocument();
  }
};

export const LmrOptionnelleEtZero: Story = {
  args: {
    residue: residueWithOptionalLmr(0)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Valeur du résultat')).toBeInTheDocument();
    await expect(
      canvas.queryByText('Valeur de la LMR')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText(/Résultat brut supérieur à la LMR/)
    ).not.toBeInTheDocument();
  }
};
