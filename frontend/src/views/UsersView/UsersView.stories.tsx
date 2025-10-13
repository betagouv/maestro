import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuiDsfrThemeProvider } from '../../App';
import { UsersView } from './UsersView';

const meta = {
  title: 'Views/Users',
  component: UsersView,
  args: {},
  decorators: [
    (Story) => (
      <MuiDsfrThemeProvider>
        <Story />
      </MuiDsfrThemeProvider>
    )
  ]
} satisfies Meta<typeof UsersView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
