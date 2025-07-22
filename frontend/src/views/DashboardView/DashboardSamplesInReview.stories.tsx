import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardSamplesInReview } from './DashboardSamplesInReview';

const meta = {
  title: 'Views/DashboardView/DashboardSamplesInReview',
  component: DashboardSamplesInReview
} satisfies Meta<typeof DashboardSamplesInReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: ''
  }
};
