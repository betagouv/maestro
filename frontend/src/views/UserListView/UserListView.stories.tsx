import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuiDsfrThemeProvider } from '../../App';
import { UserListView } from './UserListView';
import { getMockApi } from '../../services/mockApiClient';
import { fn } from 'storybook/dist/test';
import { genUser } from 'maestro-shared/test/userFixtures';

const meta = {
  title: 'Views/Users',
  component: UserListView,
  parameters: {
    apiClient: getMockApi({
      useFindUsersQuery: { data: Array.from(Array(10).keys()).map( u => genUser())}
    })
  }
} satisfies Meta<typeof UserListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
