import type { Meta, StoryObj } from '@storybook/react';

import { HomeViewContainer } from './HomeView';

const meta: Meta<typeof HomeViewContainer> = {
  title: 'Example/HomeViewContainer',
  component: HomeViewContainer,

};

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    children: <div>Un super message</div>
  }
};

