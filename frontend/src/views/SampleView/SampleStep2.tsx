import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixList, MatrixPartList } from 'shared/foodex2/Matrix';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { SampleStage, SampleStageList } from 'shared/schema/Sample/SampleStage';
import {
  SampleStorageCondition,
  SampleStorageConditionList,
} from 'shared/schema/Sample/SampleStorageCondition';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample;
}

const SampleStep2 = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
  const [matrix, setMatrix] = useState(partialSample.matrix);
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

  const [updateSample] = useUpdateSampleMutation();

  const Form = Sample.pick({
    matrixKind: true,
    matrix: true,
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
    matrixKind,
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
      matrixKind,
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
              defaultValue={matrixKind ?? ''}
              options={selectOptionsFromList(['Fruits', 'Légumes'])}
              onChange={(e) => setMatrixKind(e.target.value)}
              inputForm={form}
              inputKey="matrixKind"
              whenValid="Catégorie de matrice correctement renseignée."
              data-testid="matrixkind-select"
              label="Catégorie de matrice (obligatoire)"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={matrix ?? ''}
              options={selectOptionsFromList(MatrixList)}
              onChange={(e) => setMatrix(e.target.value as string)}
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
              defaultValue={matrixPart ?? ''}
              options={selectOptionsFromList(MatrixPartList)}
              onChange={(e) => setMatrixPart(e.target.value)}
              inputForm={form}
              inputKey="matrixPart"
              whenValid="Partie du végétal correctement renseignée."
              data-testid="matrixpart-select"
              label="Partie du végétal (obligatoire)"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={cultureKind ?? ''}
              options={selectOptionsFromList(['Bio', 'Conventionnel'])}
              onChange={(e) => setCultureKind(e.target.value)}
              inputForm={form}
              inputKey="cultureKind"
              whenValid="Type de culture correctement renseigné."
              data-testid="culturekind-select"
              label="Type de culture"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-4')}>
            <AppSelect<FormShape>
              defaultValue={stage ?? ''}
              options={selectOptionsFromList(SampleStageList)}
              onChange={(e) => setStage(e.target.value as SampleStage)}
              inputForm={form}
              inputKey="stage"
              whenValid="Stade de prélèvement correctement renseigné."
              data-testid="stage-select"
              label="Stade de prélèvement (obligatoire)"
              required
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
              options={selectOptionsFromList(SampleStorageConditionList)}
              onChange={(e) =>
                setStorageCondition(e.target.value as SampleStorageCondition)
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
