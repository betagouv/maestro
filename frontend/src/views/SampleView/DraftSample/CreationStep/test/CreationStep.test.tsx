import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { format } from 'date-fns';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { genProgrammingPlan } from 'shared/test/testFixtures';
import { store } from 'src/store/store';
import CreationStep from 'src/views/SampleView/DraftSample/CreationStep/CreationStep';
import { mockRequests } from '../../../../../../test/requestUtils.test';

const programmingPlan1 = {
  ...genProgrammingPlan(),
  kind: 'Surveillance',
};
const programmingPlan2 = {
  ...genProgrammingPlan(),
  kind: 'Control',
};
const programmingPlanRequest = {
  pathname: `/api/programming-plans?status=Validated`,
  response: {
    body: JSON.stringify([programmingPlan1, programmingPlan2]),
  },
};

// const companySearchResult = genCompanySearchResult();
// const companySearchRequest = {
//   pathname: `/api/companies/search?q=Company`,
//   response: { body: JSON.stringify([companySearchResult]) },
// };

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
          <CreationStep />
        </BrowserRouter>
      </Provider>
    );

    expect(
      screen.getByTestId('draft_sample_creation_form')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('sampledAt-input')).toHaveLength(2);
    expect(screen.getAllByTestId('department-select')).toHaveLength(2);
    expect(screen.getAllByTestId('geolocationX-input')).toHaveLength(2);
    expect(screen.getAllByTestId('geolocationY-input')).toHaveLength(2);
    expect(screen.getAllByTestId('parcel-input')).toHaveLength(2);
    expect(screen.getAllByTestId('programmingPlanId-radio')).toHaveLength(1);
    expect(screen.getAllByTestId('legalContext-radio')).toHaveLength(1);
    expect(screen.getAllByTestId('companySearch-input')).toHaveLength(1);
    expect(screen.getAllByTestId('resytalId-input')).toHaveLength(2);
    expect(screen.getAllByTestId('notes-input')).toHaveLength(2);

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should set inputs with default values', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CreationStep />
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
          <CreationStep />
        </BrowserRouter>
      </Provider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText('Veuillez renseigner le département.')
    ).toBeInTheDocument();
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
  //   const departmentSelect = screen.getAllByTestId('department-select')[1];
  //   const programmingPlan1Radio = await within(
  //     screen.getByTestId('programmingPlanId-radio')
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
  //     await user.selectOptions(departmentSelect, '08');
  //     await user.click(programmingPlan1Radio);
  //     await user.click(legalContextARadio);
  //     await user.type(resytalIdInput, '22123456');
  //     await user.type(notesInput, 'Comment');
  //     await user.click(screen.getByTestId('submit-button'));
  //   });
  //   expect(
  //     screen.queryByText('Veuillez renseigner le département.')
  //   ).not.toBeInTheDocument();
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
