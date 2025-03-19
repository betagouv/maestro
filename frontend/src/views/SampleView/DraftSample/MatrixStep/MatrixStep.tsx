import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  CultureKind,
  CultureKindLabels,
  CultureKindList
} from 'maestro-shared/referential/CultureKind';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  MatrixPart,
  MatrixPartLabels,
  MatrixPartList
} from 'maestro-shared/referential/Matrix/MatrixPart';
import {
  Species,
  SpeciesLabels,
  SpeciesList
} from 'maestro-shared/referential/Species';
import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import { SampleDocumentTypeList } from 'maestro-shared/schema/File/FileType';
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
  SampleMatrixData,
  SampleMatrixSpecificData,
  SampleMatrixSpecificDataPFAS,
  SampleMatrixSpecificDataPPV
} from 'maestro-shared/schema/Sample/Sample';
import React, { useContext, useMemo, useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { z } from 'zod';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppUpload from '../../../../components/_app/AppUpload/AppUpload';
import SampleDocument from '../../../../components/SampleDocument/SampleDocument';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import { useAppSelector } from '../../../../hooks/useStore';
import { ApiClientContext } from '../../../../services/apiClient';
import NextButton from '../NextButton';

export interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const MatrixStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const { user } = useAuthentication();
  const { readonly } = usePartialSample(partialSample);
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
  const [matrix, setMatrix] = useState(partialSample.matrix);
  const [matrixDetails, setMatrixDetails] = useState(
    partialSample.matrixDetails
  );
  const [matrixPart, setMatrixPart] = useState(partialSample.matrixPart);
  const [stage, setStage] = useState(partialSample.stage);

  const [species, setSpecies] = useState(
    SampleMatrixSpecificDataPFAS.safeParse(partialSample.specificData).success
      ? SampleMatrixSpecificDataPFAS.parse(partialSample.specificData).species
      : undefined
  );
  const [cultureKind, setCultureKind] = useState(
    SampleMatrixSpecificDataPPV.safeParse(partialSample.specificData).success
      ? SampleMatrixSpecificDataPPV.parse(partialSample.specificData)
          .cultureKind
      : undefined
  );
  const [releaseControl, setReleaseControl] = useState(
    SampleMatrixSpecificDataPPV.safeParse(partialSample.specificData).success
      ? SampleMatrixSpecificDataPPV.parse(partialSample.specificData)
          .releaseControl
      : undefined
  );
  const [files, setFiles] = useState<File[]>([]);
  const [documentIds, setDocumentIds] = useState(partialSample.documentIds);
  const [notesOnMatrix, setNotesOnMatrix] = useState(
    partialSample.notesOnMatrix
  );
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdate] = apiClient.useCreateOrUpdateSampleMutation();
  const [createDocument] = apiClient.useCreateDocumentMutation();
  const [deleteDocument] = apiClient.useDeleteDocumentMutation();

  const { data: prescriptionsData } = apiClient.useFindPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId as string,
      context: partialSample.context as Context
    },
    {
      skip: !partialSample.programmingPlanId || !partialSample.context
    }
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery(
      {
        programmingPlanId: partialSample.programmingPlanId as string,
        context: partialSample.context as Context,
        region: isCreatedPartialSample(partialSample)
          ? partialSample.region
          : user?.region
      },
      {
        skip: !partialSample.programmingPlanId || !partialSample.context
      }
    );

  const prescriptions = useMemo(() => {
    return prescriptionsData?.filter((p) =>
      regionalPrescriptions?.find((rp) => rp.prescriptionId === p.id)
    );
  }, [prescriptionsData, regionalPrescriptions]);

  const Form = SampleMatrixData;

  type FormShape = typeof Form.shape;
  type FilesFormShape = typeof FilesForm.shape;

  const FilesForm = z.object({
    files: FileInput(SampleDocumentTypeList, true)
  });

  const specificData = useMemo(() => {
    const domain = programmingPlan?.domain;
    if (!domain) {
      return;
    }
    const data = (() => {
      if (domain === 'PFAS') {
        return { species };
      }
      if (domain === 'PPV') {
        return { cultureKind, releaseControl };
      }
    })();

    return { domain, ...data } as SampleMatrixSpecificData;
  }, [programmingPlan, species, cultureKind, releaseControl]);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save('DraftItems');
      navigateToSample(partialSample.id, 3);
    });
  };

  const save = async (status = partialSample.status) => {
    const prescription = prescriptions?.find(
      (p) =>
        matrix &&
        stage &&
        p.matrixKind === matrixKind &&
        p.stages.includes(stage)
    );
    const regionalPrescription = regionalPrescriptions?.find(
      (rp) => rp.prescriptionId === prescription?.id
    );

    await createOrUpdate({
      ...partialSample,
      matrixDetails,
      matrixKind,
      matrix,
      matrixPart,
      stage,
      specificData,
      documentIds,
      notesOnMatrix,
      status,
      prescriptionId: prescription?.id,
      laboratoryId:
        regionalPrescription?.laboratoryId ?? partialSample.laboratoryId
    });
  };

  const form = useForm(
    Form,
    {
      matrixKind,
      matrix,
      matrixDetails,
      matrixPart,
      stage,
      specificData,
      documentIds,
      notesOnMatrix,
      prescriptionId: partialSample.prescriptionId,
      laboratoryId: partialSample.laboratoryId
    },
    save
  );
  const selectFiles = async () => {
    await filesForm.validate(async () => {
      const newDocumentIds = await Promise.all(
        files.map(async (file) => {
          const document = await createDocument({
            file,
            kind: 'SampleDocument'
          }).unwrap();

          return document.id;
        })
      );

      setDocumentIds([...(documentIds ?? []), ...newDocumentIds]);
      filesForm.reset();
    });
  };

  const filesForm = useForm(
    FilesForm,
    {
      files
    },
    selectFiles
  );

  const removeDocument = async (documentId: string) => {
    await deleteDocument(documentId);
    setDocumentIds((documentIds ?? []).filter((id) => id !== documentId));
  };

  return (
    <form data-testid="draft_sample_matrix_form" className="sample-form">
      <AppRequiredText />

      {programmingPlan?.domain === 'PFAS' && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={species ?? ''}
              options={selectOptionsFromList(SpeciesList, {
                labels: SpeciesLabels,
                defaultLabel: 'Sélectionner une espèce',
                withSort: true
              })}
              onChange={(e) => setSpecies(e.target.value as Species)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['species']}
              whenValid="Expèce animale correctement renseigné."
              data-testid="species-select"
              label="Espèce animale"
              required
            />
          </div>
        </div>
      )}
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSearchInput
            value={matrixKind ?? ''}
            options={selectOptionsFromList(
              MatrixKindList.filter((matrixKind) =>
                prescriptions?.find((p) => p.matrixKind === matrixKind)
              ),
              {
                labels: MatrixKindLabels,
                withSort: true,
                withDefault: false
              }
            )}
            placeholder="Sélectionner une catégorie"
            onSelect={(value) => {
              setMatrixKind(value as MatrixKind);
              setMatrix(undefined);
              setStage(undefined);
            }}
            state={form.messageType('matrixKind')}
            stateRelatedMessage={form.message('matrixKind')}
            whenValid="Type de matrice correctement renseignée."
            label="Catégorie de matrice programmée"
            required
            inputProps={{
              disabled: readonly,
              'data-testid': 'matrix-kind-select'
            }}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSearchInput
            value={matrix ?? ''}
            options={selectOptionsFromList(
              matrixKind
                ? (MatrixListByKind[matrixKind as MatrixKind] ?? matrixKind)
                : [],
              {
                labels: MatrixLabels,
                withSort: true,
                withDefault: false
              }
            )}
            placeholder="Sélectionner une matrice"
            onSelect={(value) => {
              setMatrix(value as Matrix);
            }}
            state={form.messageType('matrix')}
            stateRelatedMessage={form.message('matrix')}
            whenValid="Matrice correctement renseignée."
            data-testid="matrix-select"
            label="Matrice"
            required
            inputProps={{
              disabled: readonly,
              'data-testid': 'matrix-select'
            }}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            value={stage ?? ''}
            options={selectOptionsFromList(
              StageList.filter(
                (stage) =>
                  !prescriptions ||
                  prescriptions.find(
                    (p) =>
                      p.matrixKind === matrixKind && p.stages.includes(stage)
                  )
              ),
              {
                labels: StageLabels,
                defaultLabel: 'Sélectionner un stade'
              }
            )}
            onChange={(e) => setStage(e.target.value as Stage)}
            inputForm={form}
            inputKey="stage"
            whenValid="Stade de prélèvement correctement renseigné."
            data-testid="stage-select"
            label="Stade de prélèvement"
            required
            disabled={readonly}
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextInput<FormShape>
            defaultValue={matrixDetails ?? ''}
            onChange={(e) => setMatrixDetails(e.target.value)}
            inputForm={form}
            inputKey="matrixDetails"
            whenValid="Détail de la matrice correctement renseigné."
            data-testid="matrixdetails-input"
            label="Détail de la matrice"
            hintText="Champ facultatif pour précisions supplémentaires"
            disabled={readonly}
          />
        </div>
        {programmingPlan?.domain === 'PPV' && (
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              defaultValue={cultureKind ?? ''}
              options={selectOptionsFromList(CultureKindList, {
                labels: CultureKindLabels,
                defaultLabel: 'Sélectionner un type de culture'
              })}
              onChange={(e) => setCultureKind(e.target.value as CultureKind)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['cultureKind']}
              whenValid="Type de culture correctement renseigné."
              data-testid="culturekind-select"
              label="Type de culture"
              disabled={readonly}
            />
          </div>
        )}
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            defaultValue={matrixPart ?? ''}
            options={selectOptionsFromList(MatrixPartList, {
              labels: MatrixPartLabels,
              defaultLabel: 'Sélectionner une partie du végétal'
            })}
            onChange={(e) => setMatrixPart(e.target.value as MatrixPart)}
            inputForm={form}
            inputKey="matrixPart"
            whenValid="Partie du végétal correctement renseignée."
            data-testid="matrixpart-select"
            label="LMR / Partie du végétal concernée"
            required
            disabled={readonly}
          />
        </div>
      </div>
      {programmingPlan?.domain === 'PPV' && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <ToggleSwitch
              label="Contrôle libératoire"
              checked={releaseControl ?? false}
              onChange={(checked) => setReleaseControl(checked)}
              showCheckedHint={false}
              disabled={readonly}
            />
          </div>
        </div>
      )}
      {!readonly && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <span className={cx('fr-text--md', 'fr-text--bold')}>
              Compléments
            </span>
            <AppUpload<FilesFormShape>
              label="Pièces jointes"
              hint="Ajoutez si besoin un document ou une photo pour accompagner votre prélèvement JPG, PNG, PDF (10Mo maximum)"
              nativeInputProps={{
                onChange: (event: any) =>
                  setFiles(Array.from(event.target.files))
              }}
              className={cx('fr-mb-2w')}
              inputForm={filesForm}
              inputKey="files"
              acceptFileTypes={[...SampleDocumentTypeList]}
              whenValid="fichiers valides"
              multiple
              withPhoto={true}
            />
          </div>
        </div>
      )}
      {documentIds?.map((documentId) => (
        <SampleDocument
          key={`document-${documentId}`}
          documentId={documentId}
          onRemove={removeDocument}
          readonly={readonly}
        />
      ))}

      <hr />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput<FormShape>
            rows={1}
            defaultValue={notesOnMatrix ?? ''}
            onChange={(e) => setNotesOnMatrix(e.target.value)}
            inputForm={form}
            inputKey="notesOnMatrix"
            whenValid="Note correctement renseignée."
            data-testid="notes-input"
            label="Note additionnelle"
            hintText="Champ facultatif pour précisions supplémentaires (date de semis, précédent cultural, traitements faits, protocole de prélèvement et note inspecteur, etc.)"
            disabled={readonly}
          />
        </div>
      </div>
      <hr className={cx('fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={clsx(cx('fr-col-12'), 'sample-actions')}>
          <ul
            className={cx(
              'fr-btns-group',
              'fr-btns-group--inline-md',
              'fr-btns-group--between',
              'fr-btns-group--icon-left'
            )}
          >
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={
                  !readonly
                    ? [
                        PreviousButton({
                          sampleId: partialSample.id,
                          onSave: () => save('Draft'),
                          currentStep: 2
                        }),
                        {
                          children: 'Enregistrer en brouillon',
                          iconId: 'fr-icon-save-line',
                          priority: 'tertiary',
                          onClick: async (e: React.MouseEvent<HTMLElement>) => {
                            e.preventDefault();
                            await save();
                            setIsSaved(true);
                          },
                          nativeButtonProps: {
                            'data-testid': 'save-button'
                          }
                        }
                      ]
                    : [
                        PreviousButton({
                          sampleId: partialSample.id,
                          currentStep: 2
                        })
                      ]
                }
              />
            </li>
            <li>
              {!readonly ? (
                <Button
                  children="Continuer"
                  onClick={submit}
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  data-testid="submit-button"
                />
              ) : (
                <NextButton partialSample={partialSample} currentStep={2} />
              )}
            </li>
          </ul>
        </div>
        {isCreatedPartialSample(partialSample) && !readonly && (
          <SupportDocumentDownload partialSample={partialSample} />
        )}
      </div>
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

export default MatrixStep;
