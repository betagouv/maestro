import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  genAuthUser,
  NationalCoordinator
} from 'maestro-shared/test/userFixtures';
import { within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import DocumentView from './DocumentView';

const meta = {
  title: 'Views/DocumentView',
  component: DocumentView
} satisfies Meta<typeof DocumentView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewDocument: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({})
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
  }
};
