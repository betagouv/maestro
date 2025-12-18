import { Meta, StoryObj } from '@storybook/react-vite';
import { CircleProgress } from './CircleProgress';

const meta = {
  title: 'Components/CircleProgress',

  component: CircleProgress
} satisfies Meta<typeof CircleProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progress: 33,
    sizePx: 100,
    type: 'percentage'
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
export const Total: Story = {
  args: {
    ...Default.args,
    type: 'total',
    values: [40, 20, 40],
    colors: ['#00A95F', '#E4794A', '#F3EDE5'],
    total: 100
  }
};
export const TotalExceeded: Story = {
  args: {
    ...Default.args,
    type: 'total',
    values: [6, 2],
    total: 6
  }
};
