import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { FieldsTable } from './FieldsTable';
import { storyFields, storySachaFields } from './storyFixtures';

const meta = {
  title: 'Views/SpecificDataFields/FieldsTable',
  component: FieldsTable,
  args: {
    fields: storyFields,
    sachaFields: storySachaFields,
    readOnly: false,
    onDelete: fn(),
    onAdd: fn(),
    onEdit: fn()
  }
} satisfies Meta<typeof FieldsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    fields: [],
    sachaFields: []
  }
};

export const NoSachaConfig: Story = {
  args: {
    sachaFields: []
  }
};

export const ReadOnly: Story = {
  args: {
    readOnly: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByTitle('Ajouter un descripteur')
    ).not.toBeInTheDocument();
    await expect(canvas.queryAllByTitle('Supprimer')).toHaveLength(0);
    await expect(canvas.getAllByTitle('Consulter')).toHaveLength(
      storyFields.length
    );
  }
};
