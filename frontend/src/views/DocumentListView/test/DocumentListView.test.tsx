import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { genDocument } from 'shared/test/documentFixtures';
import { genAuthUser, genUser } from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import DocumentListView from 'src/views/DocumentListView/DocumentListView';
import { mockRequests } from '../../../../test/requestUtils.test';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

let store: Store;
const authUser = genAuthUser();
const nationalCoordinator = {
  ...genUser('NationalCoordinator'),
  id: authUser.userId,
};
const sampler = {
  ...genUser('Sampler'),
  id: 'SamplerId',
};

describe('DocumentListView', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser },
      },
    });
  });

  test('should render the document list view', async () => {
    const document = genDocument(nationalCoordinator.id);
    mockRequests([
      {
        pathname: `/api/documents/resources`,
        response: { body: JSON.stringify([document]) },
      },
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

  test('should render the upload form when the user has the permission', async () => {
    mockRequests([
      {
        pathname: `/api/users/${nationalCoordinator.id}/infos`,
        response: { body: JSON.stringify(nationalCoordinator) },
      },
    ]);

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

  test('should not render the upload form when the user does not have the permission', async () => {
    mockRequests([
      {
        pathname: `/api/users/${sampler.id}/infos`,
        response: { body: JSON.stringify(sampler) },
      },
    ]);
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
