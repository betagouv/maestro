import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SubPlanMatrices } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ProgrammingPlanMatrixSettings } from './ProgrammingPlanMatrixSettings';

const meta = {
  title: 'Views/ProgrammingPlanSettingsView/ProgrammingPlanMatrixSettings',
  component: ProgrammingPlanMatrixSettings,
  args: {
    matrices: null,
    label: 'Matrice(s)',
    required: true,
    disabled: false,
    errorMessage: undefined,
    onChange: fn()
  },
  render: function Render({ matrices: initialMatrices, onChange, ...props }) {
    const [matrices, setMatrices] = useState<SubPlanMatrices | null>(
      initialMatrices
    );
    return (
      <ProgrammingPlanMatrixSettings
        {...props}
        matrices={matrices}
        onChange={(matrices) => {
          setMatrices(matrices);
          onChange(matrices);
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
    matrices: {
      operator: 'Or',
      items: [{ matrixKind: 'A00QT', matrices: [] }]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('radio', { name: 'Toutes (et)' })
    ).not.toBeInTheDocument();
  }
};

export const MatrixKindWithMatrices: Story = {
  args: {
    matrices: {
      operator: 'Or',
      items: [
        {
          matrixKind: 'A01GP',
          matrices: ['A01GV', 'A01GY', 'A01GS', 'A0DVG']
        }
      ]
    }
  }
};

export const SeveralMatrixKinds: Story = {
  args: {
    matrices: {
      operator: 'Or',
      items: [
        { matrixKind: 'A00QT', matrices: ['A00QV', 'A00QY'] },
        { matrixKind: 'A01GP', matrices: [] }
      ]
    }
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('radio', { name: 'Une parmi (ou)' })
    ).toBeChecked();

    await userEvent.click(canvas.getByRole('radio', { name: 'Toutes (et)' }));

    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'And',
      items: [
        { matrixKind: 'A00QT', matrices: ['A00QV', 'A00QY'] },
        { matrixKind: 'A01GP', matrices: [] }
      ]
    });
    await expect(
      canvas.getByRole('radio', { name: 'Toutes (et)' })
    ).toBeChecked();
  }
};

export const RemoveMatrixKindBackToOr: Story = {
  args: {
    matrices: {
      operator: 'And',
      items: [
        { matrixKind: 'A00QT', matrices: [] },
        { matrixKind: 'A01GP', matrices: [] }
      ]
    }
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Radis et similaires' })
    );

    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'Or',
      items: [{ matrixKind: 'A01GP', matrices: [] }]
    });
    await expect(
      canvas.queryByRole('radio', { name: 'Toutes (et)' })
    ).not.toBeInTheDocument();
  }
};

export const RemoveLastMatrixKind: Story = {
  args: {
    matrices: {
      operator: 'Or',
      items: [{ matrixKind: 'A00QT', matrices: [] }]
    }
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Radis et similaires' })
    );

    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await expect(
      canvas.getByRole('button', { name: 'Ajouter catégorie(s) de matrice' })
    ).toBeInTheDocument();
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    required: false,
    matrices: {
      operator: 'And',
      items: [
        { matrixKind: 'A00QT', matrices: [] },
        { matrixKind: 'A01GP', matrices: ['A01GS'] }
      ]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Radis et similaires', {
        selector: '.fr-tag:not(.fr-tag--dismiss)'
      })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Mirabelles', {
        selector: '.fr-tag:not(.fr-tag--dismiss)'
      })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Radis et similaires' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Mirabelles' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Modifier' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('radio', { name: 'Toutes (et)' })
    ).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Une parmi (ou)' })
    ).toBeDisabled();
  }
};

export const DisabledWithoutMatrices: Story = {
  args: { disabled: true, required: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', {
        name: 'Ajouter catégorie(s) de matrice'
      })
    ).not.toBeInTheDocument();
  }
};

export const WithError: Story = {
  args: {
    errorMessage: 'Veuillez renseigner au moins une catégorie de matrice.'
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        'Veuillez renseigner au moins une catégorie de matrice.'
      )
    ).toBeVisible();
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
    await expect(args.onChange).toHaveBeenCalledWith({
      operator: 'Or',
      items: [{ matrixKind: 'A01GP', matrices: ['A01GS'] }]
    });
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
