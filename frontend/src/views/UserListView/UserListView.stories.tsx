import type { Meta, StoryObj } from '@storybook/react-vite';
import { genUser } from 'maestro-shared/test/userFixtures';
import { getMockApi } from '../../services/mockApiClient';
import { UserListView } from './UserListView';

const meta = {
  title: 'Views/Users',
  component: UserListView,
  parameters: {
    apiClient: getMockApi({
      useFindUsersQuery: {
        data: Array.from(Array(10).keys()).map(() => genUser())
      }
    })
  }
} satisfies Meta<typeof UserListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
