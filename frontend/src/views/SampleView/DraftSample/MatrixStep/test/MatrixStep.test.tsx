import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CultureKindList } from 'maestro-shared/referential/CultureKind';
import { MatrixPartList } from 'maestro-shared/referential/Matrix/MatrixPart';
import {
  genPrescription,
  genRegionalPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import config from 'src/utils/config';
import MatrixStep from 'src/views/SampleView/DraftSample/MatrixStep/MatrixStep';
import {
  getRequestCalls,
  mockRequests
} from '../../../../../../test/requestTestUtils';

import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { Region } from 'maestro-shared/referential/Region';
import { StageList } from 'maestro-shared/referential/Stage';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { act } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import { ProviderTest } from '../../../../../../test/ProviderTest';

let store: Store;
const sampler = genUser({
  role: 'Sampler'
});
const programmingPlan = genProgrammingPlan();
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A001M',
  stages: [oneOf(StageList), oneOf(StageList)]
});
const prescription2 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A00TQ'
});
const regionalPrescription1 = genRegionalPrescription({
  prescriptionId: prescription1.id
});
const regionalPrescription2 = genRegionalPrescription({
  prescriptionId: prescription2.id
});
const prescriptionsRequest = {
  pathname: `/api/prescriptions?programmingPlanId=${programmingPlan.id}&context=Control`,
  response: { body: JSON.stringify([prescription1, prescription2]) }
};
const regionalPrescriptionRequest = (region: Region) => ({
  pathname: `/api/prescriptions/regions?programmingPlanId=${
    programmingPlan.id
  }&context=Control&region=${region}`,
  response: {
    body: JSON.stringify([regionalPrescription1, regionalPrescription2])
  }
});

describe('DraftSampleMatrixStep', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser: genAuthUser(sampler) }
      }
    });
  });

  const user = userEvent.setup();

  test('should render form successfully', async () => {
    mockRequests([prescriptionsRequest]);

    render(
      <ProviderTest store={store}>
        <MatrixStep
          partialSample={{
            ...genSampleContextData({
              programmingPlanId: programmingPlan.id
            }),
            ...genCreatedSampleData({ sampler }),
            region: sampler.region as Region
          }}
        />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('matrix-kind-select')).toHaveLength(1);
    expect(screen.getAllByTestId('matrix-select')).toHaveLength(1);
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
    mockRequests([prescriptionsRequest]);

    render(
      <ProviderTest store={store}>
        <MatrixStep
          partialSample={{
            ...genSampleContextData({
              programmingPlanId: programmingPlan.id
            }),
            ...genCreatedSampleData({ sampler }),
            region: sampler.region as Region
          }}
        />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
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
  });

  test('should save on blur without handling errors', async () => {
    const createdSample = {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        context: 'Control'
      }),
      ...genCreatedSampleData({ sampler }),
      region: sampler.region as Region
    };
    mockRequests([
      prescriptionsRequest,
      regionalPrescriptionRequest(createdSample.region),
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) }
      }
    ]);

    render(
      <ProviderTest store={store}>
        <MatrixStep partialSample={createdSample} />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    const matrixKindInput = screen.getAllByTestId('matrix-kind-select')[0];
    const stageSelect = screen.getAllByTestId('stage-select')[1];

    await act(async () => {
      await user.click(matrixKindInput);
    });

    const matrixKindListbox = await screen.findByRole('listbox');
    expect(matrixKindListbox).toBeInTheDocument();
    await waitFor(async () => {
      expect(within(matrixKindListbox).getAllByRole('option').length).toBe(2);
    });

    await act(async () => {
      await user.selectOptions(
        matrixKindListbox,
        MatrixKindLabels[prescription1.matrixKind]
      );
      await user.click(stageSelect);
    });
    expect(
      screen.queryByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
    ).not.toBeInTheDocument();
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
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        context: 'Control'
      }),
      ...genCreatedSampleData({ sampler }),
      prescriptionId: prescription1.id,
      region: sampler.region as Region
    };

    mockRequests([
      prescriptionsRequest,
      regionalPrescriptionRequest(createdSample.region),
      {
        pathname: `/api/samples/${createdSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify(createdSample) }
      }
    ]);

    render(
      <ProviderTest store={store}>
        <MatrixStep partialSample={createdSample} />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    const matrixKindInput = screen.getAllByTestId('matrix-kind-select')[0];
    const matrixInput = screen.getAllByTestId('matrix-select')[0];
    const stageSelect = screen.getAllByTestId('stage-select')[1];
    const matrixDetailsInput = screen.getAllByTestId('matrixdetails-input')[1];
    const cultureKindSelect = screen.getAllByTestId('culturekind-select')[1];
    const matrixPartSelect = screen.getAllByTestId('matrixpart-select')[1];
    const notesInput = screen.getAllByTestId('notes-input')[1];
    const submitButton = screen.getByTestId('submit-button');

    await act(async () => {
      await user.click(matrixKindInput);
    });
    const matrixKindListbox = await screen.findByRole('listbox');

    await act(async () => {
      await user.selectOptions(
        matrixKindListbox,
        MatrixKindLabels[prescription1.matrixKind]
      ); //1 call
      await user.click(matrixInput);
    });

    const matrixListbox = await screen.findByRole('listbox');

    await act(async () => {
      await user.selectOptions(
        matrixListbox,
        MatrixLabels[MatrixListByKind[prescription1.matrixKind][1]]
      ); //1 call
    });

    await act(async () => {
      await user.selectOptions(stageSelect, prescription1.stages[1]); //1 call
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
    ).toHaveLength(20);

    expect(calls).toContainEqual({
      url: `${config.apiEndpoint}/api/samples/${createdSample.id}`,
      method: 'PUT',
      body: {
        ...createdSample,
        createdAt: createdSample.createdAt.toISOString(),
        lastUpdatedAt: createdSample.lastUpdatedAt.toISOString(),
        sampledAt: createdSample.sampledAt.toISOString(),
        status: 'DraftItems',
        matrixKind: prescription1.matrixKind,
        matrix: MatrixListByKind[prescription1.matrixKind][1],
        matrixPart: MatrixPartList[0],
        cultureKind: CultureKindList[0],
        stage: prescription1.stages[1],
        matrixDetails: 'Details',
        notesOnMatrix: 'Comment'
      }
    });
  });
});
