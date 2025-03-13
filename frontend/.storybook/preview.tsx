import '@codegouvfr/react-dsfr/main.css';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import { configureStore } from '@reduxjs/toolkit';
import type { Preview } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import '../src/App.scss';
import { applicationReducer } from '../src/store/store';
import { ApiClientContext } from '../src/services/apiClient';
import { mockApiClient } from '../src/services/mockApiClient';

const store = configureStore({
  reducer: applicationReducer
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
    const { apiClient = mockApiClient } = parameters
    return (
      <MemoryRouter>
        <Provider store={store}>
          <ApiClientContext.Provider value={apiClient}>
            <Story />
          </ApiClientContext.Provider>
        </Provider>
      </MemoryRouter>
    );
  }
};

export default preview;
