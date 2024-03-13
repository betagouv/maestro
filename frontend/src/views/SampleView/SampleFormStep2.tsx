import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { format, parse } from 'date-fns';
import { useState } from 'react';
import { MatrixList, MatrixPartList } from 'shared/foodex2/Matrix';
import { PartialSample, SampleUpdate } from 'shared/schema/Sample';
import { SampleStage, SampleStageList } from 'shared/schema/SampleStage';
import {
  SampleStorageCondition,
  SampleStorageConditionList,
} from 'shared/schema/SampleStorageCondition';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  sample: PartialSample;
}

const SampleFormStep2 = ({ sample }: Props) => {
  const [matrixKind, setMatrixKind] = useState(sample.matrixKind);
  const [matrix, setMatrix] = useState(sample.matrix);
  const [matrixPart, setMatrixPart] = useState(sample.matrixPart);
  const [stage, setStage] = useState(sample.stage);
  const [quantity, setQuantity] = useState(sample.quantity);
  const [quantityUnit, setQuantityUnit] = useState(sample.quantityUnit);
  const [cultureKind, setCultureKind] = useState(sample.cultureKind);
  const [compliance200263, setCompliance200263] = useState(
    sample.compliance200263
  );
  const [storageCondition, setStorageCondition] = useState(
    sample.storageCondition
  );
  const [pooling, setPooling] = useState(sample.pooling);
  const [releaseControl, setReleaseControl] = useState(sample.releaseControl);
  const [sampleCount, setSampleCount] = useState(sample.sampleCount);
  const [temperatureMaintenance, setTemperatureMaintenance] = useState(
    sample.temperatureMaintenance
  );
  const [expiryDate, setExpiryDate] = useState(sample.expiryDate);
  const [sealId, setSealId] = useState(sample.sealId);

  const [updateSample] = useUpdateSampleMutation();

  const Form = SampleUpdate;

  const form = useForm(Form, {
    matrixKind,
    matrix,
    matrixPart,
    stage,
    quantity,
    quantityUnit,
    cultureKind,
    compliance200263,
    storageCondition,
    pooling,
    releaseControl,
    sampleCount,
    temperatureMaintenance,
    expiryDate,
    sealId,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate();
    if (form.isValid()) {
      await save();
    }
  };

  const save = async () => {
    await updateSample({
      sampleId: sample.id,
      sampleUpdate: {
        matrixKind,
        matrix,
        matrixPart,
        stage,
        quantity,
        quantityUnit,
        cultureKind,
        compliance200263,
        storageCondition,
        pooling,
        releaseControl,
        sampleCount,
        temperatureMaintenance,
        expiryDate,
        sealId,
      },
    });
  };

  return (
    <form data-testid="draft_sample_2_form">
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
          <AppTextInput<FormShape>
            type="number"
            defaultValue={quantity ?? ''}
            onChange={(e) => setQuantity(Number(e.target.value))}
            inputForm={form}
            inputKey="quantity"
            whenValid="Quantité correctement renseignée."
            data-testid="quantity-input"
            label="Quantité (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={quantityUnit ?? ''}
            options={selectOptionsFromList(['kg', 'g', 'mg', 'µg'])}
            onChange={(e) => setQuantityUnit(e.target.value)}
            inputForm={form}
            inputKey="quantityUnit"
            whenValid="Unité de quantité correctement renseignée."
            data-testid="quantityunit-select"
            label="Unité de quantité (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppTextInput<FormShape>
            type="number"
            defaultValue={sampleCount ?? ''}
            onChange={(e) => setSampleCount(Number(e.target.value))}
            inputForm={form}
            inputKey="sampleCount"
            whenValid="Nombre d'échantillons correctement renseigné."
            data-testid="samplecount-input"
            label="Nombre d'échantillons (obligatoire)"
            required
          />
        </div>
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <ToggleSwitch
            label="Conformité 2002/63"
            checked={compliance200263 ?? false}
            onChange={(checked) => setCompliance200263(checked)}
            showCheckedHint={false}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <ToggleSwitch
            label="Recours au poolage"
            checked={pooling ?? false}
            onChange={(checked) => setPooling(checked)}
            showCheckedHint={false}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <ToggleSwitch
            label="Contrôle libératoire"
            checked={releaseControl ?? false}
            onChange={(checked) => setReleaseControl(checked)}
            showCheckedHint={false}
          />
        </div>
        <div
          className={cx(
            'fr-col-12',
            'fr-col-sm-4',
            'fr-col-offset-md-8--right'
          )}
        >
          <ToggleSwitch
            label="Maintenance de température"
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
            type="number"
            defaultValue={sealId ?? ''}
            onChange={(e) => setSealId(Number(e.target.value))}
            inputForm={form}
            inputKey="sealId"
            whenValid="Numéro de scellé correctement renseigné."
            data-testid="sealid-input"
            label="Numéro de scellé (obligatoire)"
            required
          />
        </div>
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <div className={cx('fr-col-12')}>
        <ButtonsGroup
          inlineLayoutWhen="md and up"
          buttons={[
            {
              children: 'Enregistrer',
              onClick: save,
              priority: 'secondary',
              type: 'button',
            },
            {
              children: 'Valider le prélèvement',
              onClick: submit,
            },
          ]}
        />
      </div>
    </form>
  );
};

export default SampleFormStep2;
