import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { genDocument } from 'maestro-shared/test/documentFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import DocumentListView from 'src/views/DocumentListView/DocumentListView';
import { beforeEach } from 'vitest';
import { mockRequests } from '../../../../test/requestTestUtils';

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useParams: vi.fn()
  };
});

import { describe, expect, test, vi } from 'vitest';
import { ProviderTest } from '../../../../test/ProviderTest';
let store: Store;
const nationalCoordinator = genUser({
  roles: ['NationalCoordinator']
});

const sampler = genUser({
  roles: ['Sampler'],
  id: 'SamplerId'
});

describe('DocumentListView', () => {
  describe('for national coordinator', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      store = configureStore({
        reducer: applicationReducer,
        middleware: applicationMiddleware,
        preloadedState: {
          auth: { authUser: genAuthUser(nationalCoordinator) }
        }
      });
    });

    test('should render the document list view', async () => {
      const document = genDocument({
        createdBy: nationalCoordinator.id
      });
      mockRequests([
        {
          pathname: `/api/documents/resources`,
          response: { body: JSON.stringify([document]) }
        }
      ]);

      render(
        <ProviderTest store={store}>
            <DocumentListView />
        </ProviderTest>
      );

      expect(screen.getByText('Ressources')).toBeInTheDocument();
      await waitFor(async () => {
        expect(screen.getByTestId('document-table')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(document.filename)).toBeInTheDocument();
      });
    });

    test('should render the upload form', async () => {
      render(
        <ProviderTest store={store}>
            <DocumentListView />
        </ProviderTest>
      );
      await waitFor(() => {
        expect(screen.getByTestId('add-document')).toBeInTheDocument();
      });
    });
  });

  describe('for sampler', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      store = configureStore({
        reducer: applicationReducer,
        middleware: applicationMiddleware,
        preloadedState: {
          auth: { authUser: genAuthUser(sampler) }
        }
      });
    });

    test('should render the document list view', async () => {
      const document = genDocument({
        createdBy: nationalCoordinator.id
      });
      mockRequests([
        {
          pathname: `/api/documents/resources`,
          response: { body: JSON.stringify([document]) }
        }
      ]);

      render(
        <ProviderTest store={store}>
            <DocumentListView />
        </ProviderTest>
      );

      expect(screen.getByText('Ressources')).toBeInTheDocument();
      await waitFor(async () => {
        expect(screen.getByTestId('document-table')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(document.filename)).toBeInTheDocument();
      });
    });

    test('should not render the upload form', async () => {
      render(
        <ProviderTest store={store}>
            <DocumentListView />
        </ProviderTest>
      );
      await waitFor(() => {
        expect(screen.queryByTestId('add-document')).not.toBeInTheDocument();
      });
    });
  });
});
