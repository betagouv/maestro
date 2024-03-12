import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { useEffect, useState } from 'react';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/schema/Department';
import { SampleToCreate, UserLocation } from 'shared/schema/Sample';
import {
  SampleContext,
  SampleContextLabels,
  SampleContextList,
} from 'shared/schema/SampleContext';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';

interface Props {
  onValid: (draftSample: SampleToCreate) => void;
}

const SampleFormStep1 = ({ onValid }: Props) => {
  const [resytalId, setResytalId] = useState('');
  const [context, setContext] = useState<SampleContext>();
  const [userLocation, setUserLocation] = useState<UserLocation>();
  const [department, setDepartment] = useState<Department>();

  const Form = SampleToCreate;

  const form = useForm(Form, {
    userLocation,
    resytalId,
    context,
    department,
  });

  type FormShape = typeof Form.shape;

  const sampleContextOptions = selectOptionsFromList(
    SampleContextList,
    SampleContextLabels
  );

  const departmentOptions = selectOptionsFromList(
    DepartmentList,
    DepartmentLabels
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(() => {
      onValid({
        userLocation: userLocation as UserLocation,
        resytalId,
        context: context as SampleContext,
        department: department as Department,
      });
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          x: (position.coords as GeolocationCoordinates).latitude,
          y: (position.coords as GeolocationCoordinates).longitude,
        });
      });
    }
  }, []);

  return (
    <form data-testid="draft_sample_1_form">
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-pb-10w')}>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect
            defaultValue=""
            options={departmentOptions}
            onChange={(e) => setDepartment(e.target.value as Department)}
            inputForm={form}
            inputKey="department"
            whenValid="Département correctement renseigné."
            data-testid="department-select"
            label="Département (obligatoire)"
            required
          />
        </div>
        <div
          className={cx(
            'fr-col-12',
            'fr-col-sm-4',
            'fr-col-offset-sm-4--right'
          )}
        >
          <AppSelect
            defaultValue=""
            options={sampleContextOptions}
            onChange={(e) => setContext(e.target.value as SampleContext)}
            inputForm={form}
            inputKey="context"
            whenValid="Contexte correctement renseigné."
            data-testid="context-select"
            label="Contexte (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppTextInput<FormShape>
            type="text"
            value={resytalId}
            onChange={(e) => setResytalId(e.target.value)}
            inputForm={form}
            inputKey="resytalId"
            whenValid="Identifiant Resytal correctement renseigné."
            data-testid="resytalId-input"
            label="Identifiant Resytal (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <Select
            label=" Cadre juridique"
            nativeSelectProps={{ defaultValue: '' }}
            disabled={true}
          >
            <option value="" disabled selected>
              TODO ?
            </option>
          </Select>
        </div>
        {form.hasIssue('userLocation') && (
          <div className={cx('fr-col-12')}>
            <Alert
              description="Pour pouvoir continuer, veuillez autoriser le navigateur à accéder à votre position."
              severity="error"
              title="Géolocalisation non disponible."
            />
          </div>
        )}

        <div className={cx('fr-col-12')}>
          <Button data-testid="submit-button" onClick={submit}>
            Créer le prélèvement
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SampleFormStep1;
