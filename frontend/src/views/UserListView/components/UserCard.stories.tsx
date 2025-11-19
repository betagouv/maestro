import type { Meta, StoryObj } from '@storybook/react-vite';
import { genUser } from 'maestro-shared/test/userFixtures';
import { fn } from 'storybook/test';
import { UserCard } from './UserCard';

const meta = {
  title: 'Views/Users/UserCard',
  component: UserCard,
  args: {
    user: genUser({}),
    onEdit: fn(),
    onDisable: fn()
  }
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
