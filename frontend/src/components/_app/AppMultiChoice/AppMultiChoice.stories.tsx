import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AppMultiChoice } from './AppMultiChoice';

const label = 'Stade(s) de prélèvement';

const buildOptions = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    value: `option-${index + 1}`,
    label: `Option ${index + 1}`
  }));

const meta = {
  title: 'Components/MultiChoice',
  component: AppMultiChoice,
  args: {
    label,
    format: 'auto',
    options: buildOptions(8),
    values: [],
    onChange: fn()
  },
  render: function Render(args) {
    const [values, setValues] = useState(args.values);
    return (
      <AppMultiChoice
        {...args}
        values={values}
        onChange={(newValues) => {
          setValues(newValues);
          args.onChange(newValues);
        }}
      />
    );
  }
} satisfies Meta<typeof AppMultiChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

const openModal = async (canvasElement: HTMLElement, buttonName: string) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: buttonName }));
  const dialog = await waitFor(() => {
    const element = canvas.getByRole('dialog', { name: label });
    expect(element).toBeVisible();
    return element;
  });
  const modal = within(dialog);
  await waitFor(() =>
    expect(modal.getByLabelText('Rechercher une option')).toBeVisible()
  );
  return modal;
};

const waitForModalClosed = async (
  modal: Awaited<ReturnType<typeof openModal>>
) =>
  waitFor(() =>
    expect(
      modal.queryByRole('button', { name: 'Enregistrer' })
    ).not.toBeInTheDocument()
  );

export const AutoWithFewOptions: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: label });

    await expect(within(group).getAllByRole('checkbox')).toHaveLength(8);
    await expect(
      canvas.queryByRole('button', { name: `Ajouter des options — ${label}` })
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Option 3' }));
    await expect(
      canvas.getByRole('checkbox', { name: 'Option 3' })
    ).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(['option-3']);

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Option 3' }));
    await expect(
      canvas.getByRole('checkbox', { name: 'Option 3' })
    ).not.toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith([]);
  }
};

export const AutoWithManyOptions: Story = {
  args: {
    options: buildOptions(300)
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);

    const modal = await openModal(
      canvasElement,
      `Ajouter des options — ${label}`
    );

    await userEvent.type(modal.getByLabelText('Rechercher une option'), '12');
    await userEvent.click(
      await modal.findByRole('checkbox', { name: 'Tout sélectionner (13)' })
    );

    await expect(
      modal.getByRole('checkbox', { name: 'Option 12' })
    ).toBeChecked();
    await expect(
      modal.getByRole('checkbox', { name: 'Option 212' })
    ).toBeChecked();

    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));

    const expectedValues = buildOptions(300)
      .filter((option) => option.label.includes('12'))
      .map((option) => option.value);
    await expect(args.onChange).toHaveBeenCalledWith(expectedValues);

    await waitForModalClosed(modal);

    await expect(
      canvas.getAllByRole('button', { name: /^Option/ })
    ).toHaveLength(10);
    await expect(canvas.getByText('+ 3 autres')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Modifier — ${label}` })
    ).toBeInTheDocument();
  }
};

export const ManySelectedOptions: Story = {
  args: {
    options: buildOptions(300),
    values: buildOptions(25).map((option) => option.value)
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getAllByRole('button', { name: /^Option/ })
    ).toHaveLength(10);
    await expect(canvas.getByText('+ 15 autres')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Modifier — ${label}` })
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Option 1' }));

    await expect(args.onChange).toHaveBeenLastCalledWith(
      buildOptions(25)
        .slice(1)
        .map((option) => option.value)
    );
    await expect(
      canvas.getByRole('button', { name: 'Option 11' })
    ).toBeInTheDocument();
    await expect(canvas.getByText('+ 14 autres')).toBeInTheDocument();
  }
};

export const AllOptionsSelected: Story = {
  args: {
    options: buildOptions(20),
    values: buildOptions(20).map((option) => option.value)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Toutes les options')).toBeInTheDocument();
    await expect(
      canvas.queryAllByRole('button', { name: /^Option/ })
    ).toHaveLength(0);

    const modal = await openModal(canvasElement, `Modifier — ${label}`);
    await userEvent.click(modal.getByRole('checkbox', { name: 'Option 1' }));
    await userEvent.click(modal.getByRole('button', { name: 'Enregistrer' }));
    await waitForModalClosed(modal);

    await expect(
      canvas.queryByText('Toutes les options')
    ).not.toBeInTheDocument();
    await expect(
      canvas.getAllByRole('button', { name: /^Option/ })
    ).toHaveLength(10);
    await expect(canvas.getByText('+ 9 autres')).toBeInTheDocument();
  }
};

export const HeaderCheckboxStates: Story = {
  args: {
    options: buildOptions(20)
  },
  play: async ({ canvasElement }) => {
    const modal = await openModal(
      canvasElement,
      `Ajouter des options — ${label}`
    );
    const header = modal.getByRole('checkbox', {
      name: 'Tout sélectionner (20)'
    });

    await expect(header).not.toBeChecked();
    await expect(header).not.toBePartiallyChecked();

    await userEvent.click(modal.getByRole('checkbox', { name: 'Option 1' }));
    await expect(header).toBePartiallyChecked();

    await userEvent.click(header);
    await expect(header).toBeChecked();
    for (const checkbox of modal.getAllByRole('checkbox')) {
      await expect(checkbox).toBeChecked();
    }

    await userEvent.click(header);
    await expect(header).not.toBeChecked();
    await expect(header).not.toBePartiallyChecked();
    await expect(
      modal.getByRole('checkbox', { name: 'Option 1' })
    ).not.toBeChecked();
  }
};

export const CancelModal: Story = {
  args: {
    options: buildOptions(20),
    values: ['option-1']
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttonName = `Modifier — ${label}`;
    const modal = await openModal(canvasElement, buttonName);

    await userEvent.click(modal.getByRole('checkbox', { name: 'Option 2' }));
    await expect(
      modal.getByRole('checkbox', { name: 'Option 2' })
    ).toBeChecked();

    await userEvent.click(modal.getByRole('button', { name: 'Fermer' }));
    await waitForModalClosed(modal);

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(
      canvas.queryByRole('button', { name: 'Option 2' })
    ).not.toBeInTheDocument();

    const reopenedModal = await openModal(canvasElement, buttonName);
    await expect(
      reopenedModal.getByRole('checkbox', { name: 'Option 2' })
    ).not.toBeChecked();
  }
};

export const ForcedCheckboxes: Story = {
  args: {
    format: 'checkboxes',
    options: buildOptions(30)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      within(canvas.getByRole('group', { name: label })).getAllByRole(
        'checkbox'
      )
    ).toHaveLength(30);
  }
};

export const ForcedModal: Story = {
  args: {
    format: 'modal',
    options: buildOptions(3),
    values: ['option-1']
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);
    await expect(
      canvas.getByRole('button', { name: 'Option 1' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Modifier — ${label}` })
    ).toBeInTheDocument();
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    values: ['option-1']
  },
  render: (args) => (
    <>
      <AppMultiChoice {...args} label="Cases" format="checkboxes" />
      <AppMultiChoice {...args} label="Modale" format="modal" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const checkbox of within(
      canvas.getByRole('group', { name: 'Cases' })
    ).getAllByRole('checkbox')) {
      await expect(checkbox).toBeDisabled();
    }
    await expect(canvas.getByText('Option 1', { selector: 'p' })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /Option 1/ })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: /Modale/ })
    ).not.toBeInTheDocument();
  }
};

export const NoOptions: Story = {
  args: {
    options: []
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Aucune option disponible.')
    ).toBeInTheDocument();
    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);
  }
};

export const HiddenLabel: Story = {
  args: {
    hideLabel: true,
    options: buildOptions(3)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: label });

    await expect(canvas.getByText(label)).toHaveClass('fr-sr-only');
    await expect(within(group).getAllByRole('checkbox')).toHaveLength(3);
  }
};
