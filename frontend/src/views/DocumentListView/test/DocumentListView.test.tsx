import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
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
        <Provider store={store}>
          <BrowserRouter>
            <DocumentListView />
          </BrowserRouter>
        </Provider>
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
        <Provider store={store}>
          <BrowserRouter>
            <DocumentListView />
          </BrowserRouter>
        </Provider>
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
        <Provider store={store}>
          <BrowserRouter>
            <DocumentListView />
          </BrowserRouter>
        </Provider>
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
        <Provider store={store}>
          <BrowserRouter>
            <DocumentListView />
          </BrowserRouter>
        </Provider>
      );
      await waitFor(() => {
        expect(screen.queryByTestId('add-document')).not.toBeInTheDocument();
      });
    });
  });
});
