import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SubPlanStages } from 'maestro-shared/referential/Stage';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ProgrammingPlanStageSettings } from './ProgrammingPlanStageSettings';

const meta = {
  title: 'Views/ProgrammingPlanSettingsView/ProgrammingPlanStageSettings',
  component: ProgrammingPlanStageSettings,
  args: {
    stages: null,
    label: 'Stade(s) de prélèvement',
    required: true,
    disabled: false,
    errorMessage: undefined,
    onChange: fn()
  },
  render: function Render({ stages: initialStages, onChange, ...props }) {
    const [stages, setStages] = useState<SubPlanStages | null>(initialStages);
    return (
      <ProgrammingPlanStageSettings
        {...props}
        stages={stages}
        onChange={(stages) => {
          setStages(stages);
          onChange(stages);
        }}
      />
    );
  }
} satisfies Meta<typeof ProgrammingPlanStageSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const openModal = async (canvasElement: HTMLElement, buttonName: string) => {
  const modal = within(
    canvasElement.ownerDocument.getElementById(
      'programming-sub-plan-stage-selection-modal'
    ) as HTMLElement
  );
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: buttonName })
  );
  await waitFor(() =>
    expect(modal.getByLabelText('Rechercher un stade')).toBeVisible()
  );
  return modal;
};

export const Empty: Story = {};

export const MixedSelection: Story = {
  args: {
    stages: [
      { stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] },
      { stage: 'MISE_SUR_LE_MARCHE', subStages: [] }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Transformation' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Entrepôt' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Mise sur le marché' })
    ).toBeInTheDocument();
    await expect(canvas.getAllByText('Tout le stade')[0]).toBeVisible();
  }
};

export const SelectSubStageAndWholeStage: Story = {
  play: async ({ canvasElement, args }) => {
    const modal = await openModal(
      canvasElement,
      'Ajouter stade(s) de prélèvement'
    );

    await expect(
      modal.queryByRole('button', { name: /Élevage/ })
    ).not.toBeInTheDocument();

    await userEvent.click(
      modal.getByRole('button', { name: 'Déplier Transformation' })
    );
    await userEvent.click(modal.getByRole('checkbox', { name: 'Entrepôt' }));
    await userEvent.click(modal.getByRole('checkbox', { name: 'Élevage' }));

    await expect(
      modal.getByRole('checkbox', { name: 'Transformation (2)' })
    ).toBePartiallyChecked();

    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    await expect(args.onChange).toHaveBeenLastCalledWith([
      { stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] },
      { stage: 'ELEVAGE', subStages: [] }
    ]);
  }
};

export const SearchSubStage: Story = {
  play: async ({ canvasElement, args }) => {
    const modal = await openModal(
      canvasElement,
      'Ajouter stade(s) de prélèvement'
    );

    await userEvent.type(modal.getByLabelText('Rechercher un stade'), 'amont');

    await expect(
      modal.queryByRole('checkbox', { name: 'Transformation (2)' })
    ).not.toBeInTheDocument();

    await userEvent.click(
      await modal.findByRole('checkbox', { name: 'Amont / Fournisseur' })
    );
    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    await expect(args.onChange).toHaveBeenLastCalledWith([
      { stage: 'ALIMENTATION_ANIMALE', subStages: ['AMONT_FOURNISSEUR'] }
    ]);
  }
};

export const RemoveLastStage: Story = {
  args: {
    stages: [{ stage: 'ABATTAGE', subStages: [] }]
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Abattage' }));

    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await expect(
      canvas.getByRole('button', { name: 'Ajouter stade(s) de prélèvement' })
    ).toBeInTheDocument();
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    required: false,
    stages: [{ stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] }]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Transformation', {
        selector: '.fr-tag:not(.fr-tag--dismiss)'
      })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Entrepôt', {
        selector: '.fr-tag:not(.fr-tag--dismiss)'
      })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', {
        name: 'Modifier les stades de prélèvement'
      })
    ).not.toBeInTheDocument();
  }
};
