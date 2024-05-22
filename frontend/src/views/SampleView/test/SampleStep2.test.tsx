import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { parse, startOfDay } from 'date-fns';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CultureKindList } from 'shared/referential/CultureKind';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixKindList } from 'shared/referential/MatrixKind';
import { MatrixPartList } from 'shared/referential/MatrixPart';
import { StageList } from 'shared/referential/Stage';
import { StorageConditionList } from 'shared/referential/StorageCondition';
import { genCreatedSample } from 'shared/test/testFixtures';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import SampleStep2 from 'src/views/SampleView/SampleStep2';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../test/requestUtils.test';

describe('SampleFormStep2', () => {
  const user = userEvent.setup();

  test('should render form successfully', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getAllByTestId('matrixpart-select')).toHaveLength(2);
    expect(screen.getAllByTestId('culturekind-select')).toHaveLength(2);
    expect(screen.getAllByTestId('stage-select')).toHaveLength(2);
    expect(screen.getByLabelText('Contrôle libératoire')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'Condition de maintien du prélèvement sous température dirigée'
      )
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('expirydate-input')).toHaveLength(2);
    expect(screen.getAllByTestId('storagecondition-select')).toHaveLength(2);
    expect(screen.getAllByTestId('locationSiret-input')).toHaveLength(2);
    expect(screen.getAllByTestId('location-name-input')).toHaveLength(2);
    expect(screen.getAllByTestId('comment-input')).toHaveLength(2);

    expect(screen.getByTestId('previous-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText('Veuillez renseigner la catégorie de matrice.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner la matrice.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner la partie du végétal.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le stade de prélèvement.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le SIRET du lieu de prélèvement.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le nom du lieu de prélèvement.')
    ).toBeInTheDocument();
  });

  test('should save on blur without handling errors', async () => {
    const createdSample = genCreatedSample();
    mockRequests([
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );
    const matrixKindSelect = screen.getAllByTestId('matrixkind-select')[1];
    const matrixSelect = screen.getAllByTestId('matrix-select')[1];

    await act(async () => {
      await user.selectOptions(matrixKindSelect, MatrixKindList[0]);
      await user.click(matrixSelect);
    });
    expect(
      screen.queryByText('Veuillez renseigner la catégorie de matrice.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner la matrice.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner la partie du végétal.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le stade de prélèvement.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le SIRET du lieu de prélèvement.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le nom du lieu de prélèvement.')
    ).not.toBeInTheDocument();

    const calls = await getRequestCalls(fetchMock);
    expect(calls).toHaveLength(1);
  });

  test('should submit the sample with updating it status', async () => {
    const createdSample = genCreatedSample();

    mockRequests([
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={createdSample} />
        </BrowserRouter>
      </Provider>
    );

    const matrixKindSelect = screen.getAllByTestId('matrixkind-select')[1];
    const matrixSelect = screen.getAllByTestId('matrix-select')[1];
    const matrixPartSelect = screen.getAllByTestId('matrixpart-select')[1];
    const cultureKindSelect = screen.getAllByTestId('culturekind-select')[1];
    const stageSelect = screen.getAllByTestId('stage-select')[1];
    const expiryDateInput = screen.getAllByTestId('expirydate-input')[1];
    const storageConditionSelect = screen.getAllByTestId(
      'storagecondition-select'
    )[1];
    const locationSiretInput = screen.getAllByTestId('locationSiret-input')[1];
    const locationNameInput = screen.getAllByTestId('location-name-input')[1];
    const commentInput = screen.getAllByTestId('comment-input')[1];
    const submitButton = screen.getByTestId('submit-button');

    await act(async () => {
      await user.selectOptions(matrixKindSelect, MatrixKindList[0]); //1 call
      await user.selectOptions(matrixSelect, Matrix.options[0]); //1 call
      await user.selectOptions(matrixPartSelect, MatrixPartList[0]); //1 call
      await user.selectOptions(cultureKindSelect, CultureKindList[0]); //1 call
      await user.selectOptions(stageSelect, StageList[0]); //1 call
      await user.type(expiryDateInput, '2023-12-31'); //1 call
      await user.selectOptions(storageConditionSelect, StorageConditionList[0]); //1 call
      await user.type(locationSiretInput, '12345678901234'); //14 calls
      await user.type(locationNameInput, 'Location'); //8 calls
      await user.type(commentInput, 'Comment'); //7 calls
      await user.click(submitButton); //1 call
    });

    const calls = await getRequestCalls(fetchMock);
    expect(calls).toHaveLength(37);

    expect(calls).toContainEqual({
      url: `${config.apiEndpoint}/api/samples/${createdSample.id}`,
      method: 'PUT',
      body: {
        ...createdSample,
        createdAt: createdSample.createdAt.toISOString(),
        lastUpdatedAt: createdSample.lastUpdatedAt.toISOString(),
        sampledAt: createdSample.sampledAt.toISOString(),
        status: 'DraftItems',
        matrixKind: MatrixKindList[0],
        matrix: Matrix.options[0],
        matrixPart: MatrixPartList[0],
        cultureKind: CultureKindList[0],
        stage: StageList[0],
        expiryDate: startOfDay(
          parse('2023-12-31', 'yyyy-MM-dd', new Date())
        ).toISOString(),
        storageCondition: StorageConditionList[0],
        locationSiret: '12345678901234',
        locationName: 'Location',
        comment: 'Comment',
      },
    });
  });
});
