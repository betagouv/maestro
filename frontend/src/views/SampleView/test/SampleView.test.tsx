import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedPartialSample,
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { useParams } from 'react-router-dom';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import SampleView from 'src/views/SampleView/SampleView';
import {
  getRequestCalls,
  mockRequests
} from '../../../../test/requestTestUtils';

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ProviderTest } from '../../../../test/ProviderTest';

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useParams: vi.fn()
  };
});

let store: Store;
const sampler = genUser({
  role: 'Sampler'
});
const programmingPlan1 = genProgrammingPlan();
const programmingPlan2 = genProgrammingPlan();
const programmingPlanRequest = {
  pathname: `/api/programming-plans?status=Validated`,
  response: {
    body: JSON.stringify([programmingPlan1, programmingPlan2])
  }
};
const prescriptions = [
  genPrescription({
    programmingPlanId: programmingPlan1.id,
    context: 'Control'
  })
];
const prescriptionsRequest = {
  pathname: `/api/programming-plans/${programmingPlan1.id}/prescriptions?`,
  response: { body: JSON.stringify(prescriptions) }
};

describe('SampleView', () => {
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

  test('should render the first step for a new sample', async () => {
    vi.mocked(useParams).mockReturnValue({ sampleId: undefined });

    render(
      <ProviderTest store={store}>
        <SampleView />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(
        screen.getByTestId('draft_sample_creation_form')
      ).toBeInTheDocument();
    });
  });

  test('should render the second step for a draft sample', async () => {
    const createdSample = {
      ...genSampleContextData({
        programmingPlanId: programmingPlan1.id
      }),
      ...genCreatedSampleData({
        sampler
      }),
      status: 'DraftMatrix'
    };
    mockRequests([
      prescriptionsRequest,
      {
        pathname: `/api/samples/${createdSample.id}`,
        response: { body: JSON.stringify(createdSample) }
      }
    ]);
    vi.mocked(useParams).mockReturnValue({ sampleId: createdSample.id });

    render(
      <ProviderTest store={store}>
        <SampleView />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(
        screen.getByTestId('draft_sample_matrix_form')
      ).toBeInTheDocument();
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${createdSample.id}`)
      )
    ).toHaveLength(1);
  });

  test('should render the third step for a sample with status DraftItems', async () => {
    const draftSample = {
      ...genCreatedPartialSample(),
      status: 'DraftItems'
    };
    mockRequests([
      {
        pathname: `/api/samples/${draftSample.id}`,
        response: { body: JSON.stringify(draftSample) }
      }
    ]);
    vi.mocked(useParams).mockReturnValue({ sampleId: draftSample.id });

    render(
      <ProviderTest store={store}>
        <SampleView />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('draft_sample_items_form')).toBeInTheDocument();
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}`)
      )
    ).toHaveLength(1);
  });

  test('should render the fourth step for a sample with status Submitted', async () => {
    const draftSample = {
      ...genCreatedPartialSample(),
      status: 'Submitted'
    };
    mockRequests([
      programmingPlanRequest,
      {
        pathname: `/api/samples/${draftSample.id}`,
        response: { body: JSON.stringify(draftSample) }
      }
    ]);
    vi.mocked(useParams).mockReturnValue({ sampleId: draftSample.id });

    render(
      <ProviderTest store={store}>
        <SampleView />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('sample_data')).toBeInTheDocument();
    });

    const calls = await getRequestCalls(fetchMock);
    expect(
      calls.filter((call) =>
        call?.url.endsWith(`/api/samples/${draftSample.id}`)
      )
    ).toHaveLength(1);
  });
});
