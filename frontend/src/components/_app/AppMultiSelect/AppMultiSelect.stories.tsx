import type { Meta, StoryObj } from '@storybook/react';
import { AppMultiSelect } from './AppMultiSelect';

const meta = {
  title: 'Components/AppMultiSelect',
  component: AppMultiSelect
} satisfies Meta<typeof AppMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'id',
    label: 'Label'
  }
};
