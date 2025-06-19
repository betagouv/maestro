import type { Meta, StoryObj } from '@storybook/react-vite';

import { HomeViewContainer } from './HomeView';

const meta = {
  title: 'Views/HomeViewContainer',
  component: HomeViewContainer
} satisfies Meta<typeof HomeViewContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>Un super message</div>
  }
};
