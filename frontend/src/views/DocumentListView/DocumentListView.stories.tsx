import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { ApiClient } from '../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../services/mockApiClient';
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
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindResourcesQuery: { data: [document] }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Ressources')).toBeInTheDocument();
    await expect(canvas.getByTestId('document-table')).toBeInTheDocument();
    await expect(canvas.getByText(document.filename)).toBeInTheDocument();
    await expect(canvas.getByTestId('add-document')).toBeInTheDocument();
  }
};

export const DocumentListViewForSampler: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindResourcesQuery: { data: [document] }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Ressources')).toBeInTheDocument();
    await expect(canvas.getByTestId('document-table')).toBeInTheDocument();
    await expect(canvas.getByText(document.filename)).toBeInTheDocument();
    await expect(canvas.queryByTestId('add-document')).not.toBeInTheDocument();
  }
};
