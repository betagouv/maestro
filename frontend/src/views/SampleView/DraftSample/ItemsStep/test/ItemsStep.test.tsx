import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QuantityUnitList } from 'shared/referential/QuantityUnit';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import {
  genCreatedSampleData,
  genSampleContextData,
} from 'shared/test/sampleFixtures';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import ItemsStep from 'src/views/SampleView/DraftSample/ItemsStep/ItemsStep';
import {
  getRequestCalls,
  mockRequests,
} from '../../../../../../test/requestUtils.test';

describe('SampleStepDraftItems', () => {
  const user = userEvent.setup();
  const draftSample = {
    ...genSampleContextData(),
    ...genCreatedSampleData(),
    status: 'DraftItems' as SampleStatus,
  };

  test('should render form successfully with a default item without recipient kind choice', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ItemsStep partialSample={draftSample} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getAllByTestId('item-quantity-input-0')).toHaveLength(2);
    expect(screen.getAllByTestId('item-unit-select-0')).toHaveLength(2);
    expect(screen.getAllByTestId('item-sealid-input-0')).toHaveLength(2);
    expect(
      screen.queryByTestId('recipientKind-radio-0')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('item-quantity-input-1')
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('previous-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should add an item with recipient kind choice', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ItemsStep partialSample={draftSample} />
        </BrowserRouter>
      </Provider>
    );

    await user.click(screen.getByTestId('add-item-button'));

    expect(screen.getAllByTestId('item-quantity-input-0')).toHaveLength(2);
    expect(screen.getAllByTestId('item-unit-select-0')).toHaveLength(2);
    expect(screen.getAllByTestId('item-sealid-input-0')).toHaveLength(2);
    expect(screen.getAllByTestId('item-quantity-input-1')).toHaveLength(2);
    expect(screen.getAllByTestId('item-unit-select-1')).toHaveLength(2);
    expect(screen.getAllByTestId('item-sealid-input-1')).toHaveLength(2);
    expect(screen.getAllByTestId('recipientKind-radio-1')).toHaveLength(1);
  });

  test('should remove an item', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ItemsStep partialSample={draftSample} />
        </BrowserRouter>
      </Provider>
    );

    await user.click(screen.getByTestId('add-item-button'));
    await user.click(screen.getByTestId('remove-item-button-1'));

    expect(
      screen.queryByTestId('item-quantity-input-1')
    ).not.toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ItemsStep partialSample={draftSample} />
        </BrowserRouter>
      </Provider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });

    expect(
      screen.getByText('Veuillez renseigner la quantité.')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Veuillez renseigner l'unité de mesure.")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le numéro de scellé.')
    ).toBeInTheDocument();
  });

  test('should save the items and the sample on change without handling errors', async () => {
    mockRequests([
      {
        pathname: `/api/samples/${draftSample.id}/items`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ItemsStep partialSample={draftSample} />
        </BrowserRouter>
      </Provider>
    );

    const quantityInput = screen.getAllByTestId('item-quantity-input-0')[1];

    await act(async () => {
      await user.type(quantityInput, '10');
    });

    expect(
      screen.queryByText('Veuillez renseigner la quantité.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Veuillez renseigner l'unité de mesure.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le numéro de scellé.')
    ).not.toBeInTheDocument();

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}/items`)
      )
    ).toHaveLength(2);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}`)
      )
    ).toHaveLength(2);
  });

  test('should submit the items and update sample status', async () => {
    mockRequests([
      {
        pathname: `/api/samples/${draftSample.id}`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
      {
        pathname: `/api/samples/${draftSample.id}/items`,
        method: 'PUT',
        response: { body: JSON.stringify({}) },
      },
    ]);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ItemsStep partialSample={draftSample} />
        </BrowserRouter>
      </Provider>
    );

    const quantityInput = screen.getAllByTestId('item-quantity-input-0')[1];
    const unitSelect = screen.getAllByTestId('item-unit-select-0')[1];
    const sealidInput = screen.getAllByTestId('item-sealid-input-0')[1];

    await act(async () => {
      await user.type(quantityInput, '10'); //2 calls
      await user.selectOptions(unitSelect, QuantityUnitList[0]); //1 call
      await user.type(sealidInput, '12a'); //3 calls
      await user.click(screen.getByTestId('submit-button')); //1 call
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}/items`)
      )
    ).toHaveLength(7);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}`)
      )
    ).toHaveLength(7);

    expect(calls).toContainEqual({
      method: 'PUT',
      url: `${config.apiEndpoint}/api/samples/${draftSample.id}/items`,
      body: [
        {
          itemNumber: 1,
          quantity: 10,
          quantityUnit: QuantityUnitList[0],
          sampleId: draftSample.id,
          sealId: '12a',
          recipientKind: 'Laboratory',
        },
      ],
    });
    expect(calls).toContainEqual({
      method: 'PUT',
      url: `${config.apiEndpoint}/api/samples/${draftSample.id}`,
      body: {
        ...draftSample,
        createdAt: draftSample.createdAt.toISOString(),
        lastUpdatedAt: draftSample.lastUpdatedAt.toISOString(),
        sampledAt: draftSample.sampledAt.toISOString(),
        status: 'Submitted',
      },
    });
  });
});
