import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { act } from 'react';
import ContextStep from 'src/views/SampleView/DraftSample/ContextStep/ContextStep';

import { configureStore, Store } from '@reduxjs/toolkit';
import { applicationMiddleware, applicationReducer } from 'src/store/store';

import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { beforeEach, describe, expect, test } from 'vitest';
import { ProviderTest } from '../../../../../../test/ProviderTest';
// const companySearchResult = genCompanySearchResult();
// const companySearchRequest = {
//   pathname: `/api/companies/search?q=Company`,
//   response: { body: JSON.stringify([companySearchResult]) },
// };

let store: Store;
const sampler = genUser({
  role: 'Sampler'
});
const programmingPlan1 = genProgrammingPlan({
  contexts: ['Control', 'Surveillance']
});

describe('DraftSampleContextStep', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser: genAuthUser(sampler) },
        programmingPlan: { programmingPlan: programmingPlan1 }
      }
    });
  });

  test('should render form successfully', async () => {
    render(
      <ProviderTest store={store}>
        <ContextStep programmingPlan={programmingPlan1} />
      </ProviderTest>
    );

    await waitFor(async () => {
      expect(
        screen.getByTestId('draft_sample_creation_form')
      ).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('sampledAt-input')).toHaveLength(2);
    expect(screen.getAllByTestId('geolocationX-input')).toHaveLength(2);
    expect(screen.getAllByTestId('geolocationY-input')).toHaveLength(2);
    expect(screen.getAllByTestId('parcel-input')).toHaveLength(2);
    expect(screen.getAllByTestId('context-radio')).toHaveLength(1);
    expect(screen.getAllByTestId('legalContext-radio')).toHaveLength(1);
    expect(screen.getAllByTestId('companySearch-input')).toHaveLength(1);
    expect(screen.getAllByTestId('resytalId-input')).toHaveLength(2);
    expect(screen.getAllByTestId('notes-input')).toHaveLength(2);

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    render(
      <ProviderTest store={store}>
        <ContextStep programmingPlan={programmingPlan1} />
      </ProviderTest>
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
      screen.getByText('Veuillez renseigner le contexte.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le cadre juridique.')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Veuillez renseigner l'entité")
    ).toBeInTheDocument();
  });

  // test('should call the sample creating API on submitting', async () => {
  //   mockRequests([
  //     programmingPlanRequest,
  //     companySearchRequest,
  //     {
  //       pathname: `/api/samples`,
  //       response: { body: JSON.stringify({}) },
  //     },
  //   ]);
  //   const coords = genCoords();
  //
  //   render(
  //     <Provider store={store}>
  //       <BrowserRouter>
  //         <SampleStepCreation />
  //       </BrowserRouter>
  //     </Provider>
  //   );
  //
  //   const programmingPlan1Radio = await within(
  //     screen.getByTestId('context-radio')
  //   ).findByLabelText(
  //     ProgrammingPlanKindLabels[programmingPlan1.kind as ProgrammingPlanKind]
  //   );
  //   const legalContextARadio = within(
  //     screen.getByTestId('legalContext-radio')
  //   ).getByLabelText(LegalContextLabels['A']);
  //   const companySearchInput = screen.getByTestId('companySearch-input');
  //   const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];
  //   const notesInput = screen.getAllByTestId('notes-input')[1];
  //
  //   await act(async () => {
  //     (
  //       navigator.geolocation.getCurrentPosition as jest.Mock<any, any>
  //     ).mock.calls[0][0](coords);
  //   });
  //
  //   await act(async () => {
  //     await user.type(companySearchInput, 'Company');
  //   });
  //   await act(async () => {
  //     await user.click(
  //       await screen.findByText(
  //         `${companySearchResult.nom_raison_sociale} - ${companySearchResult.siege.siret}`
  //       )
  //     );
  //   });
  //   await act(async () => {
  //     await user.click(programmingPlan1Radio);
  //     await user.click(legalContextARadio);
  //     await user.type(resytalIdInput, '22123456');
  //     await user.type(notesInput, 'Comment');
  //     await user.click(screen.getByTestId('submit-button'));
  //   });
  //   expect(
  //     screen.queryByText('Veuillez renseigner le contexte.')
  //   ).not.toBeInTheDocument();
  //   expect(
  //     screen.queryByText('Veuillez renseigner le cadre juridique.')
  //   ).not.toBeInTheDocument();
  //   expect(
  //     screen.queryByText("L'identifiant Resytal doit être au format 22XXXXXX.")
  //   ).not.toBeInTheDocument();
  //   expect(
  //     screen.getByText("Veuillez renseigner l'entité")
  //   ).not.toBeInTheDocument();
  //
  //   const calls = await getRequestCalls(fetchMock);
  //   expect(calls).toHaveLength(1);
  //
  //   expect(calls).toContainEqual({
  //     url: `${config.apiEndpoint}/api/samples`,
  //     method: 'POST',
  //     body: {
  //       sampledAt: expect.stringContaining(format(new Date(), 'yyyy-MM-dd')),
  //       department: '08',
  //       resytalId: '22123456',
  //       programmingPlanId: programmingPlan1.id,
  //       legalContext: 'A',
  //       geolocation: {
  //         x: coords.coords.latitude,
  //         y: coords.coords.longitude,
  //       },
  //       notesOnCreation: 'Comment',
  //     },
  //   });
  // });
});
