import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminView } from './AdminView';

const meta = {
  title: 'Views/AdminView',
  component: AdminView
} satisfies Meta<typeof AdminView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
