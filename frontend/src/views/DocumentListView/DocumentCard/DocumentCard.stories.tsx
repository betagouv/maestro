import type { Meta, StoryObj } from '@storybook/react-vite';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  genAuthUser,
  NationalCoordinator
} from 'maestro-shared/test/userFixtures';
import { getMockApi } from '../../../services/mockApiClient';
import DocumentCard from './DocumentCard';

const meta = {
  title: 'Components/DocumentCard',
  component: DocumentCard
} satisfies Meta<typeof DocumentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutNote: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({})
  },
  args: {
    document: genDocument({
      notes: undefined
    }),
    onViewNotes: () => {},
    onRemove: () => {}
  }
};

export const WithNote: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({})
  },
  args: {
    document: genDocument({
      notes: 'Ceci est une note pour le document.'
    }),
    onViewNotes: () => {},
    onRemove: () => {}
  }
};
