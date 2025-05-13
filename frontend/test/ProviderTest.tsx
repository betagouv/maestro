import { FunctionComponent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { apiClient, ApiClientContext } from '../src/services/apiClient';
import { Store } from '@reduxjs/toolkit';

type Props = {
  store: Store;
  children: ReactNode
};
export const ProviderTest: FunctionComponent<Props> = ({ store, children,..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <Provider store={store}>
      <ApiClientContext.Provider value={apiClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ApiClientContext.Provider>
    </Provider>
  );
};
