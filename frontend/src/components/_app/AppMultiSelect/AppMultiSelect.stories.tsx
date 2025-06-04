import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { AppSelectOption } from '../AppSelect/AppSelectOption';
import { AppMultiSelect } from './AppMultiSelect';

const meta = {
  title: 'Components/AppMultiSelect',
  component: AppMultiSelect,
  args: { onSelect: fn() }
} satisfies Meta<typeof AppMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const options: AppSelectOption[] = [
  {
    value: '1',
    label: 'First',
    selected: false
  },
  {
    value: '2',
    label: 'Second',
    selected: false
  }
];

export const Default: Story = {
  args: {
    id: 'id',
    label: 'Label',
    options
  }
};

export const SelectedOption: Story = {
  args: {
    id: 'id',
    label: 'Label',
    options: [
      ...options,
      {
        value: '3',
        label: 'Selected',
        selected: true
      }
    ]
  }
};

export const OptionsGroups: Story = {
  args: {
    id: 'id',
    label: 'Label',
    optionsGroups: [
      {
        label: 'First group',
        options
      },
      {
        label: 'Second group',
        options: [
          {
            value: '4',
            label: 'Sec'
          }
        ]
      }
    ]
  }
};
