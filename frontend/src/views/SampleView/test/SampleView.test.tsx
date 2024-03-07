import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from 'src/store/store';
import SampleView from 'src/views/SampleView/SampleView';

describe('SampleView', () => {
  const user = userEvent.setup();

  test('should render the first step', () => {
    render(<SampleView />);

    expect(screen.getByTestId('draft_sample_1_form')).toBeInTheDocument();
  });

  test('should render the second step on submitting the first step', async () => {
    render(
      <Provider store={store}>
        <SampleView />
      </Provider>
    );

    const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];
    const contextSelect = screen.getAllByTestId('context-select')[1];

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
      await user.type(resytalIdInput, '22123456');
      await user.selectOptions(contextSelect, 'Surveillance');
      await user.click(screen.getByTestId('submit-button'));
    });

    expect(screen.getByTestId('draft_sample_2_form')).toBeInTheDocument();
  });
});
