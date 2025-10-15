import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuiDsfrThemeProvider } from '../../App';
import { UserListView } from './UserListView';

const meta = {
  title: 'Views/Users',
  component: UserListView,
  args: {},
  decorators: [
    (Story) => (
      <MuiDsfrThemeProvider>
        <Story />
      </MuiDsfrThemeProvider>
    )
  ]
} satisfies Meta<typeof UserListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
