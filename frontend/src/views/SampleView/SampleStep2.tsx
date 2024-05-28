import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CultureKind,
  CultureKindLabels,
  CultureKindList,
} from 'shared/referential/CultureKind';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixList } from 'shared/referential/Matrix/MatrixList';
import {
  MatrixPart,
  MatrixPartLabels,
  MatrixPartList,
} from 'shared/referential/MatrixPart';
import { Stage, StageLabels } from 'shared/referential/Stage';
import {
  StorageCondition,
  StorageConditionLabels,
  StorageConditionList,
} from 'shared/referential/StorageCondition';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { isDefined } from 'shared/utils/utils';
import MatrixSelectModal from 'src/components/MatrixSelectModal/MatrixSelectModal';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample;
}

const SampleStep2 = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState(partialSample.matrix);
  const [matrixDetails, setMatrixDetails] = useState(
    partialSample.matrixDetails
  );
  const [matrixPart, setMatrixPart] = useState(partialSample.matrixPart);
  const [stage, setStage] = useState(partialSample.stage);
  const [cultureKind, setCultureKind] = useState(partialSample.cultureKind);
  const [storageCondition, setStorageCondition] = useState(
    partialSample.storageCondition
  );
  const [releaseControl, setReleaseControl] = useState(
    partialSample.releaseControl
  );
  const [temperatureMaintenance, setTemperatureMaintenance] = useState(
    partialSample.temperatureMaintenance
  );
  const [expiryDate, setExpiryDate] = useState(partialSample.expiryDate);
  const [locationSiret, setLocationSiret] = useState(
    partialSample.locationSiret
  );
  const [locationName, setLocationName] = useState(partialSample.locationName);
  const [comment, setComment] = useState(partialSample.comment);
  const [additionalMatrix, setAdditionalMatrix] = useState<{
    matrix: Matrix;
    stage: Stage;
  }>();

  const [updateSample] = useUpdateSampleMutation();

  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: partialSample.programmingPlanId },
    {
      skip: !partialSample.programmingPlanId,
    }
  );

  const Form = Sample.pick({
    matrix: true,
    matrixDetails: true,
    matrixPart: true,
    stage: true,
    cultureKind: true,
    storageCondition: true,
    releaseControl: true,
    temperatureMaintenance: true,
    expiryDate: true,
    locationSiret: true,
    locationName: true,
    comment: true,
    status: true,
  });

  const form = useForm(Form, {
    matrix,
    matrixDetails,
    matrixPart,
    stage,
    cultureKind,
    storageCondition,
    releaseControl,
    temperatureMaintenance,
    expiryDate,
    locationSiret,
    locationName,
    comment,
    status: partialSample.status,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save('DraftItems');
      navigate(`/prelevements/${partialSample.id}?etape=3`, {
        replace: true,
      });
    });
  };

  const save = async (status = partialSample.status) => {
    await updateSample({
      ...partialSample,
      matrixDetails,
      matrix,
      matrixPart,
      stage,
      cultureKind,
      storageCondition,
      releaseControl,
      temperatureMaintenance,
      expiryDate,
      locationSiret,
      locationName,
      comment,
      status,
    });
  };

  const { userInfos } = useAuthentication();

  if (!prescriptions) {
    return <></>;
  }

  return (
    <>
      <form
        data-testid="draft_sample_2_form"
        onChange={async (e) => {
          e.preventDefault();
          await save();
        }}
      >
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              value={matrix ?? ''}
              options={selectOptionsFromList(
                [
                  ...MatrixList.filter((matrix) =>
                    prescriptions.find((p) => p.sampleMatrix === matrix)
                  ),
                  additionalMatrix?.matrix,
                ].filter(isDefined),
                {
                  labels: MatrixLabels,
                }
              )}
              onChange={(e) => setMatrix(e.target.value as Matrix)}
              inputForm={form}
              inputKey="matrix"
              whenValid="Matrice correctement renseignée."
              data-testid="matrix-select"
              label="Matrice (obligatoire)"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={stage ?? ''}
              options={selectOptionsFromList(
                [
                  ...prescriptions
                    .filter((p) => p.sampleMatrix === matrix)
                    .map((p) => p.sampleStage),
                  additionalMatrix?.stage,
                ].filter(isDefined),
                {
                  labels: StageLabels,
                }
              )}
              onChange={(e) => setStage(e.target.value as Stage)}
              inputForm={form}
              inputKey="stage"
              whenValid="Stade de prélèvement correctement renseigné."
              data-testid="stage-select"
              label="Stade de prélèvement (obligatoire)"
              required
            />
          </div>
          <div
            className={cx('fr-col-12', 'fr-col-sm-4')}
            style={{
              display: 'flex',
              justifyContent: 'end',
              flexDirection: 'column',
            }}
          >
            <MatrixSelectModal
              excludedList={[]}
              onSelect={async (matrix, stage) => {
                setAdditionalMatrix({ matrix, stage });
                setMatrix(matrix);
                setStage(stage);
              }}
              buttonTitle="Matrice / stade hors plan"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={cultureKind ?? ''}
              options={selectOptionsFromList(CultureKindList, {
                labels: CultureKindLabels,
              })}
              onChange={(e) => setCultureKind(e.target.value as CultureKind)}
              inputForm={form}
              inputKey="cultureKind"
              whenValid="Type de culture correctement renseigné."
              data-testid="culturekind-select"
              label="Type de culture"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={matrixPart ?? ''}
              options={selectOptionsFromList(MatrixPartList, {
                labels: MatrixPartLabels,
              })}
              onChange={(e) => setMatrixPart(e.target.value as MatrixPart)}
              inputForm={form}
              inputKey="matrixPart"
              whenValid="Partie du végétal correctement renseignée."
              data-testid="matrixpart-select"
              label="Partie du végétal (obligatoire)"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppTextInput<FormShape>
              defaultValue={matrixDetails ?? ''}
              onChange={(e) => setMatrixDetails(e.target.value)}
              inputForm={form}
              inputKey="matrixDetails"
              whenValid="Détail de la matrice correctement renseigné."
              data-testid="matrixdetails-input"
              label="Détail de la matrice"
            />
          </div>
        </div>
        <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <ToggleSwitch
              label="Contrôle libératoire"
              checked={releaseControl ?? false}
              onChange={(checked) => setReleaseControl(checked)}
              showCheckedHint={false}
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-8')}>
            <ToggleSwitch
              label="Condition de maintien du prélèvement sous température dirigée"
              checked={temperatureMaintenance ?? false}
              onChange={(checked) => setTemperatureMaintenance(checked)}
              showCheckedHint={false}
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppTextInput<FormShape>
              type="date"
              defaultValue={
                expiryDate ? format(expiryDate, 'yyyy-MM-dd') : undefined
              }
              onChange={(e) =>
                setExpiryDate(parse(e.target.value, 'yyyy-MM-dd', new Date()))
              }
              inputForm={form}
              inputKey="expiryDate"
              whenValid="Date de péremption correctement renseignée."
              data-testid="expirydate-input"
              label="Date de péremption"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={storageCondition ?? ''}
              options={selectOptionsFromList(StorageConditionList, {
                labels: StorageConditionLabels,
              })}
              onChange={(e) =>
                setStorageCondition(e.target.value as StorageCondition)
              }
              inputForm={form}
              inputKey="storageCondition"
              whenValid="Condition de stockage correctement renseignée."
              data-testid="storagecondition-select"
              label="Condition de stockage"
            />
          </div>
        </div>
        <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppTextInput<FormShape>
              defaultValue={locationSiret ?? ''}
              onChange={(e) => setLocationSiret(e.target.value)}
              inputForm={form}
              inputKey="locationSiret"
              whenValid="SIRET valide"
              data-testid="locationSiret-input"
              label="SIRET (obligatoire) //TODO"
              hintText="Format 12345678901234"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppTextInput<FormShape>
              defaultValue={locationName ?? ''}
              onChange={(e) => setLocationName(e.target.value)}
              inputForm={form}
              inputKey="locationName"
              whenValid="Nom du lieu de prélèvement correctement renseigné."
              data-testid="location-name-input"
              hintText="Sera alimenté automatiquement avec le SIRET."
              label="Nom du lieu de prélèvement (obligatoire)"
              required
            />
          </div>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput<FormShape>
              rows={3}
              defaultValue={comment ?? ''}
              onChange={(e) => setComment(e.target.value)}
              inputForm={form}
              inputKey="comment"
              whenValid="Commentaire correctement renseigné."
              data-testid="comment-input"
              label="Commentaires"
            />
          </div>
        </div>
        <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
        <div className={cx('fr-col-12')}>
          <ButtonsGroup
            inlineLayoutWhen="md and up"
            buttons={[
              {
                children: 'Etape précédente',
                priority: 'secondary',
                onClick: async (e) => {
                  e.preventDefault();
                  await save('Draft');
                  navigate(`/prelevements/${partialSample.id}?etape=1`, {
                    replace: true,
                  });
                },
                nativeButtonProps: {
                  'data-testid': 'previous-button',
                },
              },
              {
                children: 'Etape suivante',
                onClick: submit,
                nativeButtonProps: {
                  'data-testid': 'submit-button',
                },
              },
            ]}
          />
        </div>
      </form>
    </>
  );
};

export default SampleStep2;
