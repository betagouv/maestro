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
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
  SampleMatrixData
} from 'maestro-shared/schema/Sample/Sample';
import React, { useMemo, useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useFindRegionalPrescriptionsQuery } from 'src/services/regionalPrescription.service';
import { useCreateOrUpdateSampleMutation } from 'src/services/sample.service';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import SavedAlert from 'src/views/SampleView/SavedAlert';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const MatrixStep = ({ partialSample }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const { user } = useAuthentication();

  const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
  const [matrix, setMatrix] = useState(partialSample.matrix);
  const [matrixDetails, setMatrixDetails] = useState(
    partialSample.matrixDetails
  );
  const [matrixPart, setMatrixPart] = useState(partialSample.matrixPart);
  const [stage, setStage] = useState(partialSample.stage);
  const [cultureKind, setCultureKind] = useState(partialSample.cultureKind);
  const [releaseControl, setReleaseControl] = useState(
    partialSample.releaseControl
  );
  const [notesOnMatrix, setNotesOnMatrix] = useState(
    partialSample.notesOnMatrix
  );
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdate] = useCreateOrUpdateSampleMutation();

  const { data: prescriptionsData } = useFindPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId as string,
      context: partialSample.context
    },
    {
      skip: !partialSample.programmingPlanId || !partialSample.context
    }
  );

  const { data: regionalPrescriptions } = useFindRegionalPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId as string,
      context: partialSample.context,
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
      cultureKind,
      releaseControl,
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
      cultureKind,
      releaseControl,
      notesOnMatrix,
      prescriptionId: partialSample.prescriptionId,
      laboratoryId: partialSample.laboratoryId
    },
    save
  );

  return (
    <form data-testid="draft_sample_matrix_form" className="sample-form">
      <AppRequiredText />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            value={matrixKind ?? ''}
            options={selectOptionsFromList(
              MatrixKindList.filter((matrixKind) =>
                prescriptions?.find((p) => p.matrixKind === matrixKind)
              ),
              {
                labels: MatrixKindLabels,
                defaultLabel: 'Sélectionner une catégorie',
                withSort: true
              }
            )}
            onChange={(e) => {
              setMatrixKind(e.target.value as MatrixKind);
              setMatrix(undefined);
              setStage(undefined);
            }}
            inputForm={form}
            inputKey="matrixKind"
            whenValid="Type de matrice correctement renseignée."
            data-testid="matrix-kind-select"
            label="Catégorie de matrice programmée"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            value={matrix ?? ''}
            options={selectOptionsFromList(
              matrixKind
                ? (MatrixListByKind[matrixKind as MatrixKind] ?? matrixKind)
                : [],
              {
                labels: MatrixLabels,
                defaultLabel: 'Sélectionner une matrice'
              }
            )}
            onChange={(e) => setMatrix(e.target.value as Matrix)}
            inputForm={form}
            inputKey="matrix"
            whenValid="Matrice correctement renseignée."
            data-testid="matrix-select"
            label="Matrice"
            required
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
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            defaultValue={cultureKind ?? ''}
            options={selectOptionsFromList(CultureKindList, {
              labels: CultureKindLabels,
              defaultLabel: 'Sélectionner un type de culture'
            })}
            onChange={(e) => setCultureKind(e.target.value as CultureKind)}
            inputForm={form}
            inputKey="cultureKind"
            whenValid="Type de culture correctement renseigné."
            data-testid="culturekind-select"
            label="Type de culture"
          />
        </div>
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
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <ToggleSwitch
            label="Contrôle libératoire"
            checked={releaseControl ?? false}
            onChange={(checked) => setReleaseControl(checked)}
            showCheckedHint={false}
          />
        </div>
      </div>
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
                  [
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
                  ] as any
                }
              />
            </li>
            <li>
              <Button
                children="Continuer"
                onClick={submit}
                iconId="fr-icon-arrow-right-line"
                iconPosition="right"
                data-testid="submit-button"
              />
            </li>
          </ul>
        </div>
        {isCreatedPartialSample(partialSample) && (
          <SupportDocumentDownload partialSample={partialSample} />
        )}
      </div>
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

export default MatrixStep;
