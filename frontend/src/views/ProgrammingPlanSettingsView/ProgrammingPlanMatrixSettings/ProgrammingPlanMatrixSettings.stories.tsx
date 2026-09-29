import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import type { MatrixSelection } from './matrixSelection';
import { ProgrammingPlanMatrixSettings } from './ProgrammingPlanMatrixSettings';

const meta = {
  title: 'Views/ProgrammingPlanSettingsView/ProgrammingPlanMatrixSettings',
  component: ProgrammingPlanMatrixSettings,
  args: {
    selection: [],
    onChange: fn()
  },
  render: function Render({ selection: initialSelection, onChange }) {
    const [selection, setSelection] =
      useState<MatrixSelection>(initialSelection);
    return (
      <ProgrammingPlanMatrixSettings
        selection={selection}
        onChange={(selection) => {
          setSelection(selection);
          onChange(selection);
        }}
      />
    );
  }
} satisfies Meta<typeof ProgrammingPlanMatrixSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const MatrixKindOnly: Story = {
  args: {
    selection: [{ matrixKind: 'A00QT', matrices: [] }]
  }
};

export const MatrixKindWithMatrices: Story = {
  args: {
    selection: [
      {
        matrixKind: 'A01GP',
        matrices: ['A01GV', 'A01GY', 'A01GS', 'A0DVG']
      }
    ]
  }
};

export const SeveralMatrixKinds: Story = {
  args: {
    selection: [
      { matrixKind: 'A00QT', matrices: ['A00QV', 'A00QY'] },
      { matrixKind: 'A01GP', matrices: [] }
    ]
  }
};

export const SelectMatrixInModal: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const modalElement = canvasElement.ownerDocument.getElementById(
      'programming-sub-plan-matrix-selection-modal'
    ) as HTMLElement;
    const modal = within(modalElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Ajouter catégorie(s) de matrice' })
    );
    await waitFor(() =>
      expect(modal.getByLabelText('Rechercher une matrice')).toBeVisible()
    );

    await userEvent.click(
      modal.getByRole('button', { name: 'Déplier Prunes et similaires' })
    );
    await userEvent.click(modal.getByRole('checkbox', { name: 'Mirabelles' }));

    await expect(
      modal.getByRole('checkbox', { name: 'Prunes et similaires (13)' })
    ).toBePartiallyChecked();
    await expect(
      modal.getByRole('button', { name: 'Prunes et similaires' })
    ).toBeInTheDocument();
    await expect(
      modal.getByRole('button', { name: 'Mirabelles' })
    ).toBeInTheDocument();

    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(modalElement).not.toBeVisible());
    await expect(args.onChange).toHaveBeenCalledWith([
      { matrixKind: 'A01GP', matrices: ['A01GS'] }
    ]);
    await expect(
      canvas.queryByRole('button', { name: 'Ajouter catégorie(s) de matrice' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Prunes et similaires' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Mirabelles' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Modifier' })
    ).toBeInTheDocument();
  }
};
