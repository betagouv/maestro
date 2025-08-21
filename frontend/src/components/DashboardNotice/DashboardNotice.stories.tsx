import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardNotice } from './DashboardNotice';

const meta = {
  title: 'Views/DashboardView/DashboardNotice',
  component: DashboardNotice
} satisfies Meta<typeof DashboardNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: `Merci pour vos retours`,
    className: ''
  }
};
