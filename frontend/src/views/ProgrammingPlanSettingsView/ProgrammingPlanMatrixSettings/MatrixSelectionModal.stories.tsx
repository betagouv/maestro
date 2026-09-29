import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MatrixSelectionModal } from './MatrixSelectionModal';
import { subMatrices } from './matrixSelection';

const storyModal = createModal({
  id: 'matrix-selection-modal-story',
  isOpenedByDefault: false
});

const meta = {
  title: 'Views/ProgrammingPlanSettingsView/MatrixSelectionModal',
  component: MatrixSelectionModal,
  args: {
    modal: storyModal,
    selection: [
      { matrixKind: 'A00QT', matrices: ['A00QV'] },
      { matrixKind: 'A01GP', matrices: ['A01GS', 'A0DVG'] }
    ],
    onSave: fn()
  }
} satisfies Meta<typeof MatrixSelectionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const openModal = async (canvasElement: HTMLElement) => {
  storyModal.open();
  const modal = within(
    canvasElement.ownerDocument.getElementById(storyModal.id) as HTMLElement
  );
  await waitFor(() =>
    expect(modal.getByLabelText('Rechercher une matrice')).toBeVisible()
  );
  return modal;
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const modal = await openModal(canvasElement);

    await expect(
      modal.getByRole('checkbox', { name: 'Prunes et similaires (13)' })
    ).toBePartiallyChecked();
    await expect(
      modal.getByRole('button', { name: /Mirabelles/ })
    ).toBeInTheDocument();
  }
};

export const CheckMatrixKind: Story = {
  args: {
    selection: []
  },
  play: async ({ canvasElement, args }) => {
    const modal = await openModal(canvasElement);
    const matrixKindCheckbox = modal.getByRole('checkbox', {
      name: 'Prunes et similaires (13)'
    });

    await userEvent.click(
      modal.getByRole('button', { name: 'Déplier Prunes et similaires' })
    );
    await userEvent.click(matrixKindCheckbox);

    await expect(matrixKindCheckbox).toBeChecked();
    await expect(
      modal.getByRole('checkbox', { name: 'Mirabelles' })
    ).toBeChecked();
    await expect(modal.getByText('Toutes les matrices')).toBeInTheDocument();

    await userEvent.click(modal.getByRole('checkbox', { name: 'Mirabelles' }));

    await expect(matrixKindCheckbox).toBePartiallyChecked();
    await expect(
      modal.queryByText('Toutes les matrices')
    ).not.toBeInTheDocument();

    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    await expect(args.onSave).toHaveBeenCalledWith([
      {
        matrixKind: 'A01GP',
        matrices: subMatrices('A01GP').filter((matrix) => matrix !== 'A01GS')
      }
    ]);
  }
};

export const SearchAndSelectMatrix: Story = {
  args: {
    selection: [{ matrixKind: 'A00QT', matrices: [] }]
  },
  play: async ({ canvasElement, args }) => {
    const modal = await openModal(canvasElement);

    await expect(
      modal.getByRole('checkbox', { name: 'Prunes et similaires (13)' })
    ).not.toBeChecked();

    await userEvent.type(
      modal.getByLabelText('Rechercher une matrice'),
      'mirabelle'
    );
    await userEvent.click(
      await modal.findByRole('checkbox', { name: 'Mirabelles' })
    );

    await expect(
      modal.getByRole('checkbox', { name: 'Prunes et similaires (13)' })
    ).toBePartiallyChecked();
    await expect(
      modal.getByRole('button', { name: /Mirabelles/ })
    ).toBeInTheDocument();

    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    await expect(args.onSave).toHaveBeenCalledWith([
      { matrixKind: 'A00QT', matrices: [] },
      { matrixKind: 'A01GP', matrices: ['A01GS'] }
    ]);
  }
};

export const UnselectAll: Story = {
  play: async ({ canvasElement, args }) => {
    const modal = await openModal(canvasElement);

    await userEvent.click(
      modal.getByRole('button', { name: 'Tout désélectionner' })
    );

    await expect(
      modal.getByRole('checkbox', { name: 'Radis et similaires (6)' })
    ).not.toBeChecked();

    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    await expect(args.onSave).toHaveBeenCalledWith([]);
  }
};
