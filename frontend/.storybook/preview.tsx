import '@codegouvfr/react-dsfr/main.css';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import { configureStore } from '@reduxjs/toolkit';
import type { Preview } from '@storybook/react-vite';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import '../src/App.scss';
import { ApiClientContext } from '../src/services/apiClient';
import { mockApiClient } from '../src/services/mockApiClient';
import { applicationReducer } from '../src/store/store';

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: applicationReducer,
    preloadedState
  });

startReactDsfr({
  defaultColorScheme: 'system',
  useLang: () => 'fr'
});
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
        <MemoryRouter initialEntries={initialEntries}>
          <Provider store={store}>
            <ApiClientContext.Provider value={apiClient}>
              <Story />
            </ApiClientContext.Provider>
          </Provider>
        </MemoryRouter>
      </MuiDsfrThemeProvider>
    );
  }
};

export default preview;
