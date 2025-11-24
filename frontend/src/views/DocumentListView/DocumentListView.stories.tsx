import type { Meta, StoryObj } from '@storybook/react-vite';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expect, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import DocumentListView from './DocumentListView';
const meta = {
  title: 'Views/DocumentListView',
  component: DocumentListView
} satisfies Meta<typeof DocumentListView>;

export default meta;
type Story = StoryObj<typeof meta>;

const document = genDocument({
  createdBy: NationalCoordinator.id
});

export const DocumentListViewForNationalCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({
      useFindResourcesQuery: { data: [document] }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Ressources')).toBeInTheDocument();
    await expect(canvas.getByText(document.name as string)).toBeInTheDocument();
    await expect(canvas.getByTestId('add-document')).toBeInTheDocument();
  }
};

export const DocumentListViewForSampler: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    },
    apiClient: getMockApi({
      useFindResourcesQuery: { data: [document] }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Ressources')).toBeInTheDocument();
    await expect(canvas.getByText(document.name as string)).toBeInTheDocument();
    await expect(canvas.queryByTestId('add-document')).not.toBeInTheDocument();
  }
};
