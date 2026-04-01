import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FieldsTable } from './FieldsTable';
import { storyFields, storySachaFields } from './storyFixtures';

const meta = {
  title: 'Views/SpecificDataFields/FieldsTable',
  component: FieldsTable,
  args: {
    fields: storyFields,
    sachaFields: storySachaFields,
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
