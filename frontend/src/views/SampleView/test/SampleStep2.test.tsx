import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { parse, startOfDay } from 'date-fns';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { MatrixList, MatrixPartList } from 'shared/foodex2/Matrix';
import { SampleStageList } from 'shared/schema/Sample/SampleStage';
import { SampleStorageConditionList } from 'shared/schema/Sample/SampleStorageCondition';
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
  //Here is SampleFormStep2 form
  // <form data-testid="draft_sample_2_form">
  //   <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={matrixKind ?? ''}
  //         options={selectOptionsFromList(['Fruits', 'Légumes'])}
  //         onChange={(e) => setMatrixKind(e.target.value)}
  //         inputForm={form}
  //         inputKey="matrixKind"
  //         whenValid="Catégorie de matrice correctement renseignée."
  //         data-testid="matrixkind-select"
  //         label="Catégorie de matrice (obligatoire)"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={matrix ?? ''}
  //         options={selectOptionsFromList(MatrixList)}
  //         onChange={(e) => setMatrix(e.target.value as string)}
  //         inputForm={form}
  //         inputKey="matrix"
  //         whenValid="Matrice correctement renseignée."
  //         data-testid="matrix-select"
  //         label="Matrice (obligatoire)"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={matrixPart ?? ''}
  //         options={selectOptionsFromList(MatrixPartList)}
  //         onChange={(e) => setMatrixPart(e.target.value)}
  //         inputForm={form}
  //         inputKey="matrixPart"
  //         whenValid="Partie du végétal correctement renseignée."
  //         data-testid="matrixpart-select"
  //         label="Partie du végétal (obligatoire)"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={cultureKind ?? ''}
  //         options={selectOptionsFromList(['Bio', 'Conventionnel'])}
  //         onChange={(e) => setCultureKind(e.target.value)}
  //         inputForm={form}
  //         inputKey="cultureKind"
  //         whenValid="Type de culture correctement renseigné."
  //         data-testid="culturekind-select"
  //         label="Type de culture"
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={stage ?? ''}
  //         options={selectOptionsFromList(SampleStageList)}
  //         onChange={(e) => setStage(e.target.value as SampleStage)}
  //         inputForm={form}
  //         inputKey="stage"
  //         whenValid="Stade de prélèvement correctement renseigné."
  //         data-testid="stage-select"
  //         label="Stade de prélèvement (obligatoire)"
  //         required
  //       />
  //     </div>
  //   </div>
  //   <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
  //   <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppTextInput<FormShape>
  //         type="number"
  //         defaultValue={quantity ?? ''}
  //         onChange={(e) => setQuantity(Number(e.target.value))}
  //         inputForm={form}
  //         inputKey="quantity"
  //         whenValid="Quantité correctement renseignée."
  //         data-testid="quantity-input"
  //         label="Quantité (obligatoire)"
  //         min={0}
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={quantityUnit ?? ''}
  //         options={selectOptionsFromList(['kg', 'g', 'mg', 'µg'])}
  //         onChange={(e) => setQuantityUnit(e.target.value)}
  //         inputForm={form}
  //         inputKey="quantityUnit"
  //         whenValid="Unité de quantité correctement renseignée."
  //         data-testid="quantityunit-select"
  //         label="Unité de quantité (obligatoire)"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppTextInput<FormShape>
  //         type="number"
  //         defaultValue={sampleCount ?? ''}
  //         onChange={(e) => setSampleCount(Number(e.target.value))}
  //         inputForm={form}
  //         inputKey="sampleCount"
  //         whenValid="Nombre d'échantillons correctement renseigné."
  //         data-testid="samplecount-input"
  //         label="Nombre d'échantillons (obligatoire)"
  //         min={0}
  //         required
  //       />
  //     </div>
  //   </div>
  //   <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
  //   <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <ToggleSwitch
  //         label="Conformité 2002/63"
  //         checked={compliance200263 ?? false}
  //         onChange={(checked) => setCompliance200263(checked)}
  //         showCheckedHint={false}
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <ToggleSwitch
  //         label="Recours au poolage"
  //         checked={pooling ?? false}
  //         onChange={(checked) => setPooling(checked)}
  //         showCheckedHint={false}
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <ToggleSwitch
  //         label="Contrôle libératoire"
  //         checked={releaseControl ?? false}
  //         onChange={(checked) => setReleaseControl(checked)}
  //         showCheckedHint={false}
  //       />
  //     </div>
  //     <div
  //       className={cx(
  //         'fr-col-12',
  //         'fr-col-sm-4',
  //         'fr-col-offset-md-8--right'
  //       )}
  //     >
  //       <ToggleSwitch
  //         label="Maintenance de température"
  //         checked={temperatureMaintenance ?? false}
  //         onChange={(checked) => setTemperatureMaintenance(checked)}
  //         showCheckedHint={false}
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppTextInput<FormShape>
  //         type="date"
  //         defaultValue={
  //           expiryDate ? format(expiryDate, 'yyyy-MM-dd') : undefined
  //         }
  //         onChange={(e) =>
  //           setExpiryDate(parse(e.target.value, 'yyyy-MM-dd', new Date()))
  //         }
  //         inputForm={form}
  //         inputKey="expiryDate"
  //         whenValid="Date de péremption correctement renseignée."
  //         data-testid="expirydate-input"
  //         label="Date de péremption"
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppSelect<FormShape>
  //         defaultValue={storageCondition ?? ''}
  //         options={selectOptionsFromList(SampleStorageConditionList)}
  //         onChange={(e) =>
  //           setStorageCondition(e.target.value as SampleStorageCondition)
  //         }
  //         inputForm={form}
  //         inputKey="storageCondition"
  //         whenValid="Condition de stockage correctement renseignée."
  //         data-testid="storagecondition-select"
  //         label="Condition de stockage"
  //       />
  //     </div>
  //   </div>
  //   <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
  //   <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppTextInput<FormShape>
  //         defaultValue={locationSiret ?? ''}
  //         onChange={(e) => setLocationSiret(e.target.value)}
  //         inputForm={form}
  //         inputKey="locationSiret"
  //         whenValid="SIRET valide"
  //         data-testid="locationSiret-input"
  //         label="SIRET (obligatoire) //TODO"
  //         hintText="Format 12345678901234"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppTextInput<FormShape>
  //         defaultValue={locationName ?? ''}
  //         onChange={(e) => setLocationName(e.target.value)}
  //         inputForm={form}
  //         inputKey="locationName"
  //         whenValid="Site d'intervention correctement renseigné."
  //         data-testid="location-name-input"
  //         hintText="Sera alimenté automatiquement avec le SIRET."
  //         label="Site d'intervention (obligatoire)"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12', 'fr-col-sm-4')}>
  //       <AppTextInput<FormShape>
  //         defaultValue={sealId ?? ''}
  //         onChange={(e) => setSealId(Number(e.target.value))}
  //         inputForm={form}
  //         inputKey="sealId"
  //         whenValid="Numéro de scellé correctement renseigné."
  //         data-testid="sealid-input"
  //         label="Numéro de scellé (obligatoire)"
  //         hintText="Format numérique"
  //         required
  //       />
  //     </div>
  //     <div className={cx('fr-col-12')}>
  //       <AppTextInput<FormShape>
  //         textArea
  //         rows={3}
  //         defaultValue={comment ?? ''}
  //         onChange={(e) => setComment(e.target.value)}
  //         inputForm={form}
  //         inputKey="comment"
  //         whenValid="Commentaire correctement renseigné."
  //         data-testid="comment-input"
  //         label="Commentaires"
  //       />
  //     </div>
  //   </div>
  //   <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
  //   {isUpdateSuccess && (
  //     <Alert
  //       severity="success"
  //       title="Les données ont bien été enregistrées."
  //       className={cx('fr-mb-2w')}
  //     />
  //   )}
  //   <div className={cx('fr-col-12')}>
  //     <ButtonsGroup
  //       inlineLayoutWhen="md and up"
  //       buttons={[
  //         {
  //           children: 'Enregistrer',
  //           onClick: () => save(false),
  //           priority: 'secondary',
  //           type: 'button',
  //         },
  //         {
  //           children: 'Valider le prélèvement',
  //           onClick: submit,
  //         },
  //       ]}
  //     />
  //   </div>
  // </form>

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
      screen.getByLabelText('Maintenance de température')
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('expirydate-input')).toHaveLength(2);
    expect(screen.getAllByTestId('storagecondition-select')).toHaveLength(2);
    expect(screen.getAllByTestId('locationSiret-input')).toHaveLength(2);
    expect(screen.getAllByTestId('location-name-input')).toHaveLength(2);
    expect(screen.getAllByTestId('comment-input')).toHaveLength(2);

    expect(screen.getByTestId('save-button')).toBeInTheDocument();
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

  test('should not handle errors on saving', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SampleStep2 partialSample={genCreatedSample()} />
        </BrowserRouter>
      </Provider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('save-button'));
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
  });

  test('should call the sample updating API on submitting', async () => {
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
      await user.selectOptions(matrixKindSelect, 'Fruits');
      await user.selectOptions(matrixSelect, MatrixList[0]);
      await user.selectOptions(matrixPartSelect, MatrixPartList[0]);
      await user.selectOptions(cultureKindSelect, 'Bio');
      await user.selectOptions(stageSelect, SampleStageList[0]);
      await user.type(expiryDateInput, '2023-12-31');
      await user.selectOptions(
        storageConditionSelect,
        SampleStorageConditionList[0]
      );
      await user.type(locationSiretInput, '12345678901234');
      await user.type(locationNameInput, 'Test');
      await user.type(commentInput, 'Test');
      await user.click(submitButton);
    });

    const calls = await getRequestCalls(fetchMock);
    expect(calls).toHaveLength(1);

    expect(calls).toContainEqual({
      url: `${config.apiEndpoint}/api/samples/${createdSample.id}`,
      method: 'PUT',
      body: {
        ...createdSample,
        createdAt: createdSample.createdAt.toISOString(),
        sampledAt: createdSample.sampledAt.toISOString(),
        status: 'DraftItems',
        matrixKind: 'Fruits',
        matrix: MatrixList[0],
        matrixPart: MatrixPartList[0],
        cultureKind: 'Bio',
        stage: SampleStageList[0],
        expiryDate: startOfDay(
          parse('2023-12-31', 'yyyy-MM-dd', new Date())
        ).toISOString(),
        storageCondition: SampleStorageConditionList[0],
        locationSiret: '12345678901234',
        locationName: 'Test',
        comment: 'Test',
      },
    });
  });
});
