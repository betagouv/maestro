import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceDocumentKindList } from 'maestro-shared/schema/Document/DocumentKind';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
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
  createdBy: NationalCoordinator.id,
  kind: oneOf(ResourceDocumentKindList)
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
    await expect(canvas.getByTestId('add-document')).toBeInTheDocument();

    const documentList = canvas.getByTestId('document-list-all-cards');
    await expect(documentList).toBeInTheDocument();
    await expect(
      within(documentList).getByText(document.name as string)
    ).toBeInTheDocument();

    const documentKindList = canvas.getByTestId(
      `document-list-${document.kind}-cards`
    );
    await expect(documentKindList).toBeInTheDocument();
    await expect(
      within(documentKindList).getByText(document.name as string)
    ).toBeInTheDocument();
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
    await expect(canvas.queryByTestId('add-document')).not.toBeInTheDocument();
    const documentList = canvas.getByTestId('document-list-all-cards');
    await expect(documentList).toBeInTheDocument();
    await expect(
      within(documentList).getByText(document.name as string)
    ).toBeInTheDocument();

    const documentKindList = canvas.getByTestId(
      `document-list-${document.kind}-cards`
    );
    await expect(documentKindList).toBeInTheDocument();
    await expect(
      within(documentKindList).getByText(document.name as string)
    ).toBeInTheDocument();
  }
};
