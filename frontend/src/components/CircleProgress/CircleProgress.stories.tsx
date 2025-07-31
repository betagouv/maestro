import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleProgress } from './CircleProgress';

const meta = {
  title: 'Components/CircleProgress',

  component: CircleProgress
} satisfies Meta<typeof CircleProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 10,
    total: 30,
    sizePx: 100,
    type: 'total'
  }
};

export const Big: Story = {
  args: {
    ...Default.args,
    sizePx: 400
  }
};

export const Small: Story = {
  args: {
    ...Default.args,
    sizePx: 50
  }
};
export const Percentage: Story = {
  args: {
    count: 100,
    sizePx: 100,
    type: 'percentage'
  }
};
