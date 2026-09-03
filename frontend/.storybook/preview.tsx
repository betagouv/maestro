import '@codegouvfr/react-dsfr/main.css';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import { configureStore } from '@reduxjs/toolkit';
import type { Preview } from '@storybook/react-vite';
import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';
import '../src/App.scss';
import '../src/i18n';
import { ApiClientContext } from '../src/services/apiClient';
import { mockApiClient } from '../src/services/mockApiClient';
import { applicationReducer } from '../src/store/store';

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: applicationReducer,
    preloadedState
  });

declare module '@codegouvfr/react-dsfr/spa' {
  interface RegisterLink {
    Link: typeof Link;
  }
}
startReactDsfr({
  defaultColorScheme: 'system',
  useLang: () => 'fr',
  Link
});
const StoryRouter = ({
  Story,
  initialEntries
}: {
  Story: React.ComponentType;
  initialEntries: string[];
}) => {
  const router = useMemo(
    () =>
      createMemoryRouter([{ path: '/*', Component: Story }], {
        initialEntries
      }),
    [Story, initialEntries]
  );
  return <RouterProvider router={router} />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: (Story, { parameters }) => {
    const {
      apiClient = mockApiClient,
      preloadedState = {},
      initialEntries = ['/']
    } = parameters;
    const store = createStore(preloadedState);
    return (
      <MuiDsfrThemeProvider>
        <Provider store={store}>
          <ApiClientContext.Provider value={apiClient}>
            <StoryRouter Story={Story} initialEntries={initialEntries} />
          </ApiClientContext.Provider>
        </Provider>
      </MuiDsfrThemeProvider>
    );
  }
};

export default preview;
