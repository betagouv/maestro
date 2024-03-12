import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useState } from 'react';
import {
  MatrixKindList,
  MatrixList,
  MatrixPartList,
} from 'shared/foodex2/Matrix';
import { SampleToUpdate } from 'shared/schema/Sample';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';

interface Props {
  onValid: () => void;
}

const SampleFormStep2 = ({ onValid }: Props) => {
  const [matrix, setMatrix] = useState<string>();
  const [matrixKind, setMatrixKind] = useState<string>();
  const [matrixPart, setMatrixPart] = useState<string>();
  const [quantity, setQuantity] = useState(0);
  const [quantityUnit, setQuantityUnit] = useState('');
  const [cultureKind, setCultureKind] = useState('');
  const [compliance200263, setCompliance200263] = useState(false);
  const [storageCondition, setStorageCondition] = useState('');
  const [pooling, setPooling] = useState(false);
  const [releaseControl, setReleaseControl] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [temperatureMaintenance, setTemperatureMaintenance] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [sealId, setSealId] = useState(0);

  const Form = SampleToUpdate;

  const form = useForm(Form, {
    matrix,
    matrixKind,
    matrixPart,
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
      onValid();
    }
  };

  return (
    <form data-testid="draft_sample_2_form">
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue=""
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
            defaultValue=""
            options={selectOptionsFromList(MatrixKindList)}
            onChange={(e) => setMatrixKind(e.target.value)}
            inputForm={form}
            inputKey="matrixKind"
            whenValid="Nature de la matrice correctement renseignée."
            data-testid="matrixkind-select"
            label="Nature de la matrice (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue=""
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
          <AppTextInput<FormShape>
            type="text"
            value={cultureKind}
            onChange={(e) => setCultureKind(e.target.value)}
            inputForm={form}
            inputKey="cultureKind"
            whenValid="Type de la culture correctement renseignée."
            data-testid="culturekind-input"
            label="Type de la culture (obligatoire)"
            required
          />
        </div>
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppTextInput<FormShape>
            type="number"
            value={quantity}
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
            defaultValue=""
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
            value={sampleCount}
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
      <div className={cx('fr-col-12')}>
        <Button data-testid="submit-button" onClick={submit}>
          Valider
        </Button>
      </div>
    </form>
  );
};

export default SampleFormStep2;
