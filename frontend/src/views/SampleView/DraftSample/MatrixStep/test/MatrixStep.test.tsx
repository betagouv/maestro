import { configureStore, Store } from '@reduxjs/toolkit';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CultureKindList } from 'shared/referential/CultureKind';
import { MatrixPartList } from 'shared/referential/MatrixPart';
import {
  genCreatedSampleData,
  genSampleContextData,
} from 'shared/test/sampleFixtures';
import {
  genAuthUser,
  genPrescriptions,
  genProgrammingPlan,
  genUser,
} from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import config from 'src/utils/config';
import MatrixStep from 'src/views/SampleView/DraftSample/MatrixStep/MatrixStep';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../../../test/requestUtils.test';

let store: Store;
const authUser = genAuthUser();
const sampler = {
  ...genUser('Sampler'),
  id: authUser.userId,
};
const userRequest = {
  pathname: `/api/users/${sampler.id}/infos`,
  response: { body: JSON.stringify(sampler) },
};
const programmingPlan = genProgrammingPlan();
const prescriptions = genPrescriptions(programmingPlan.id);
const prescriptionsRequest = {
  pathname: `/api/programming-plans/${programmingPlan.id}/prescriptions?`,
  response: { body: JSON.stringify(prescriptions) },
};

describe('SampleStepDraftInfos', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser },
      },
    });
  });

  const user = userEvent.setup();

  test('should render form successfully', async () => {
    mockRequests([userRequest, prescriptionsRequest]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MatrixStep
            partialSample={{
              ...genSampleContextData(programmingPlan.id),
              ...genCreatedSampleData(sampler),
            }}
          />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('matrix-select')).toHaveLength(2);
    expect(screen.getAllByTestId('stage-select')).toHaveLength(2);
    expect(screen.getAllByTestId('matrixdetails-input')).toHaveLength(2);
    expect(screen.getAllByTestId('culturekind-select')).toHaveLength(2);
    expect(screen.getAllByTestId('matrixpart-select')).toHaveLength(2);
    expect(screen.getByLabelText('Contrôle libératoire')).toBeInTheDocument();
    expect(screen.getAllByTestId('notes-input')).toHaveLength(2);

    expect(screen.getByTestId('previous-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    mockRequests([userRequest, prescriptionsRequest]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MatrixStep
            partialSample={{
              ...genSampleContextData(programmingPlan.id),
              ...genCreatedSampleData(sampler),
            }}
          />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText('Veuillez renseigner la matrice.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner la partie du végétal.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le stade de prélèvement.')
    ).toBeInTheDocument();
  });

  test('should save on blur without handling errors', async () => {
    const createdSample = {
      ...genSampleContextData(programmingPlan.id),
      ...genCreatedSampleData(sampler),
    };
    mockRequests([
      userRequest,
      prescriptionsRequest,
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MatrixStep partialSample={createdSample} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    const matrixSelect = screen.getAllByTestId('matrix-select')[1];
    const stageSelect = screen.getAllByTestId('stage-select')[1];

    await waitFor(async () => {
      expect(
        within(matrixSelect).getAllByRole('option').length
      ).toBeGreaterThan(2);
    });

    await act(async () => {
      await user.selectOptions(matrixSelect, prescriptions[0].matrix);
      await user.click(stageSelect);
    });
    expect(
      screen.queryByText('Veuillez renseigner la matrice.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le stade de prélèvement.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner la partie du végétal.')
    ).not.toBeInTheDocument();

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${createdSample.id}`)
      )
    ).toHaveLength(1);
  });

  test('should submit the sample with updating it status', async () => {
    const createdSample = {
      ...genSampleContextData(programmingPlan.id),
      ...genCreatedSampleData(sampler),
    };

    mockRequests([
      userRequest,
      prescriptionsRequest,
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MatrixStep partialSample={createdSample} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    const matrixSelect = screen.getAllByTestId('matrix-select')[1];
    const stageSelect = screen.getAllByTestId('stage-select')[1];
    const matrixDetailsInput = screen.getAllByTestId('matrixdetails-input')[1];
    const cultureKindSelect = screen.getAllByTestId('culturekind-select')[1];
    const matrixPartSelect = screen.getAllByTestId('matrixpart-select')[1];
    const notesInput = screen.getAllByTestId('notes-input')[1];
    const submitButton = screen.getByTestId('submit-button');

    await waitFor(async () => {
      expect(
        within(matrixSelect).getAllByRole('option').length
      ).toBeGreaterThan(2);
    });

    await act(async () => {
      await user.selectOptions(matrixSelect, prescriptions[0].matrix); //1 call
      await user.selectOptions(stageSelect, prescriptions[0].stages[0]); //1 call
      await user.type(matrixDetailsInput, 'Details'); //7 calls
      await user.selectOptions(cultureKindSelect, CultureKindList[0]); //1 call
      await user.selectOptions(matrixPartSelect, MatrixPartList[0]); //1 call
      await user.type(notesInput, 'Comment'); //7 calls
      await user.click(submitButton); //1 call
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${createdSample.id}`)
      )
    ).toHaveLength(19);

    expect(calls).toContainEqual({
      url: `${config.apiEndpoint}/api/samples/${createdSample.id}`,
      method: 'PUT',
      body: {
        ...createdSample,
        createdAt: createdSample.createdAt.toISOString(),
        lastUpdatedAt: createdSample.lastUpdatedAt.toISOString(),
        sampledAt: createdSample.sampledAt.toISOString(),
        status: 'DraftItems',
        matrix: prescriptions[0].matrix,
        matrixPart: MatrixPartList[0],
        cultureKind: CultureKindList[0],
        stage: prescriptions[0].stages[0],
        matrixDetails: 'Details',
        notesOnMatrix: 'Comment',
      },
    });
  });
});
