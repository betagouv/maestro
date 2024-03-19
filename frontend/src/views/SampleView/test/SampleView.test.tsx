import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from 'src/store/store';
import SampleView from 'src/views/SampleView/SampleView';

describe('SampleView', () => {
  test('should render the first step for a new sample', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleView />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('draft_sample_1_form')).toBeInTheDocument();
  });

  // test('should render the second step for a draft sample', async () => {
  //   const createdSample = genCreatedSample();
  //   mockRequests([
  //     {
  //       pathname: `/api/samples/${createdSample.id}`,
  //       method: 'GET',
  //       response: { body: JSON.stringify(createdSample) },
  //     },
  //   ]);
  //
  //   act(() => {
  //     render(
  //       <Provider store={store}>
  //         <MemoryRouter initialEntries={[`/prelevements/${createdSample.id}`]}>
  //           <Routes>
  //             <Route
  //               path="/prelevements/:sampleId"
  //               element={<SampleView />}
  //             ></Route>
  //           </Routes>
  //         </MemoryRouter>
  //       </Provider>
  //     );
  //   });
  //
  //
  //   await waitFor(async () => {
  //     const calls = await getRequestCalls(fetchMock);
  //     expect(calls).toHaveLength(1);
  //
  //     expect(screen.getByTestId('draft_sample_2_form')).toBeInTheDocument();
  //   });
  // });
});
