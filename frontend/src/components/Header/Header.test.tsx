import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'src/store/store';
import Header from './Header';

describe('Header', () => {
  test('should display brand', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText(
        (t) =>
          t.includes('Plan de Surveillance') && t.includes('Plan de Contrôle')
      )
    ).toBeInTheDocument();
  });
});
