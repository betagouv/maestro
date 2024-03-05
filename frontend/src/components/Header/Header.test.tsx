import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  test('should display brand', () => {
    render(<Header />);

    expect(
      screen.getByText(
        (t) =>
          t.includes('Plan de Surveillance') && t.includes('Plan de Contrôle')
      )
    ).toBeInTheDocument();
  });
});
