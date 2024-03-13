import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import SampleFormStep1 from 'src/views/SampleView/SampleFormStep1';
import { genCoords } from '../../../../test/fixtures.test';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../test/requestUtils.test';

describe('SampleFormStep1', () => {
  const user = userEvent.setup();

  test('should display form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleFormStep1 />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('draft_sample_1_form')).toBeInTheDocument();
    expect(screen.getAllByTestId('department-select')).toHaveLength(2);
    expect(screen.getAllByTestId('resytalId-input')).toHaveLength(2);
    expect(screen.getAllByTestId('context-select')).toHaveLength(2);

    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleFormStep1 />
        </BrowserRouter>
      </Provider>
    );
    const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText('Veuillez renseigner le département.')
    ).toBeInTheDocument();
    expect(
      screen.getByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le contexte.')
    ).toBeInTheDocument();

    await act(async () => {
      await user.type(resytalIdInput, '223aze12');
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).toBeInTheDocument();
  });

  test('should call the sample creating API on submitting', async () => {
    mockRequests([
      {
        pathname: `/api/samples`,
        response: { body: JSON.stringify({}) },
      },
    ]);
    const coords = genCoords();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleFormStep1 />
        </BrowserRouter>
      </Provider>
    );

    const departmentSelect = screen.getAllByTestId('department-select')[1];
    const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];
    const contextSelect = screen.getAllByTestId('context-select')[1];

    await act(async () => {
      (
        navigator.geolocation.getCurrentPosition as jest.Mock<any, any>
      ).mock.calls[0][0](coords);
    });

    await act(async () => {
      await user.selectOptions(departmentSelect, '08');
      await user.type(resytalIdInput, '22123456');
      await user.selectOptions(contextSelect, 'Surveillance');
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.queryByText('Veuillez renseigner le département.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le contexte.')
    ).not.toBeInTheDocument();

    const requests = await getRequestCalls(fetchMock);

    expect(requests).toContainEqual({
      url: `${config.apiEndpoint}/api/samples`,
      method: 'POST',
      body: {
        department: '08',
        resytalId: '22123456',
        context: 'Surveillance',
        userLocation: {
          x: coords.coords.latitude,
          y: coords.coords.longitude,
        },
      },
    });
  });
});
