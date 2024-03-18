import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { format, startOfDay } from 'date-fns';
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
    expect(screen.getAllByTestId('sampledAt-input')).toHaveLength(2);
    expect(screen.getAllByTestId('userLocationX-input')).toHaveLength(2);
    expect(screen.getAllByTestId('userLocationY-input')).toHaveLength(2);
    expect(screen.getAllByTestId('department-select')).toHaveLength(2);
    expect(screen.getAllByTestId('resytalId-input')).toHaveLength(2);
    expect(screen.getAllByTestId('planning-context-select')).toHaveLength(2);
    expect(screen.getAllByTestId('legal-context-select')).toHaveLength(2);

    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should set inputs with default values', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleFormStep1 />
        </BrowserRouter>
      </Provider>
    );

    expect(
      screen.getByDisplayValue(format(new Date(), 'yyyy-MM-dd'))
    ).toBeInTheDocument();
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
      screen.getByText('Veuillez renseigner la latitude.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner la longitude.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le département.')
    ).toBeInTheDocument();
    expect(
      screen.getByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le contexte.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le cadre juridique.')
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
    const planningContextSelect = screen.getAllByTestId(
      'planning-context-select'
    )[1];
    const legalContextSelect = screen.getAllByTestId('legal-context-select')[1];

    await act(async () => {
      (
        navigator.geolocation.getCurrentPosition as jest.Mock<any, any>
      ).mock.calls[0][0](coords);
    });

    await act(async () => {
      await user.selectOptions(departmentSelect, '08');
      await user.type(resytalIdInput, '22123456');
      await user.selectOptions(planningContextSelect, 'Surveillance');
      await user.selectOptions(legalContextSelect, 'Judicial');
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
    expect(
      screen.queryByText('Veuillez renseigner le cadre juridique.')
    ).not.toBeInTheDocument();

    const requests = await getRequestCalls(fetchMock);

    expect(requests).toContainEqual({
      url: `${config.apiEndpoint}/api/samples`,
      method: 'POST',
      body: {
        sampledAt: startOfDay(new Date()).toISOString(),
        department: '08',
        resytalId: '22123456',
        planningContext: 'Surveillance',
        legalContext: 'Judicial',
        userLocation: {
          x: coords.coords.latitude,
          y: coords.coords.longitude,
        },
      },
    });
  });
});
