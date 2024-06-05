import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { format } from 'date-fns';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { genCoords, genProgrammingPlan } from 'shared/test/testFixtures';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import SampleStepCreation from 'src/views/SampleView/SampleStepCreation';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../test/requestUtils.test';

const programmingPlan1 = genProgrammingPlan();
const programmingPlan2 = genProgrammingPlan();
const programmingPlanRequest = {
  pathname: `/api/programming-plans?status=Validated`,
  response: {
    body: JSON.stringify([programmingPlan1, programmingPlan2]),
  },
};

describe('SampleStepCreation', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('should render form successfully', () => {
    mockRequests([programmingPlanRequest]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStepCreation />
        </BrowserRouter>
      </Provider>
    );

    expect(
      screen.getByTestId('draft_sample_creation_form')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('sampledAt-input')).toHaveLength(2);
    expect(screen.getAllByTestId('geolocationX-input')).toHaveLength(2);
    expect(screen.getAllByTestId('geolocationY-input')).toHaveLength(2);
    expect(screen.getAllByTestId('department-select')).toHaveLength(2);
    expect(screen.getAllByTestId('resytalId-input')).toHaveLength(2);
    expect(screen.getAllByTestId('programming-plan-id-select')).toHaveLength(2);
    expect(screen.getAllByTestId('legal-context-select')).toHaveLength(2);
    expect(screen.getAllByTestId('comment-input')).toHaveLength(2);

    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should set inputs with default values', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStepCreation />
        </BrowserRouter>
      </Provider>
    );

    const dateInput = screen.getAllByTestId('sampledAt-input')[1];

    expect(dateInput).toHaveValue(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  });

  test('should handle errors on submitting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStepCreation />
        </BrowserRouter>
      </Provider>
    );

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
      screen.getByText('Veuillez renseigner le contexte.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le cadre juridique.')
    ).toBeInTheDocument();
  });

  test('should call the sample creating API on submitting', async () => {
    mockRequests([
      programmingPlanRequest,
      {
        pathname: `/api/samples`,
        response: { body: JSON.stringify({}) },
      },
    ]);
    const coords = genCoords();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStepCreation />
        </BrowserRouter>
      </Provider>
    );

    const departmentSelect = screen.getAllByTestId('department-select')[1];
    const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];
    const programmingPlanIdSelect = screen.getAllByTestId(
      'programming-plan-id-select'
    )[1];
    const legalContextSelect = screen.getAllByTestId('legal-context-select')[1];
    const commentInput = screen.getAllByTestId('comment-input')[1];

    await act(async () => {
      (
        navigator.geolocation.getCurrentPosition as jest.Mock<any, any>
      ).mock.calls[0][0](coords);
    });

    await act(async () => {
      await user.selectOptions(departmentSelect, '08');
      await user.type(resytalIdInput, '22123456');
      await user.selectOptions(programmingPlanIdSelect, programmingPlan1.id);
      await user.selectOptions(legalContextSelect, 'B');
      await user.type(commentInput, 'Comment');
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

    const calls = await getRequestCalls(fetchMock);
    expect(calls).toHaveLength(1);

    expect(calls).toContainEqual({
      url: `${config.apiEndpoint}/api/samples`,
      method: 'POST',
      body: {
        sampledAt: expect.stringContaining(format(new Date(), 'yyyy-MM-dd')),
        department: '08',
        resytalId: '22123456',
        programmingPlanId: programmingPlan1.id,
        legalContext: 'B',
        geolocation: {
          x: coords.coords.latitude,
          y: coords.coords.longitude,
        },
        commentCreation: 'Comment',
      },
    });
  });
});
