import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/schema/Department';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import {
  SampleLegalContext,
  SampleLegalContextLabels,
  SampleLegalContextList,
} from 'shared/schema/Sample/SampleLegalContext';
import {
  SamplePlanningContext,
  SamplePlanningContextLabels,
  SamplePlanningContextList,
} from 'shared/schema/Sample/SamplePlanningContext';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import {
  useCreateSampleMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
import { z } from 'zod';

interface Props {
  partialSample?: PartialSample;
}

const SampleFormStep1 = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [resytalId, setResytalId] = useState(partialSample?.resytalId);
  const [planningContext, setPlanningContext] = useState(
    partialSample?.planningContext
  );
  const [legalContext, setLegalContext] = useState(partialSample?.legalContext);
  const [userLocationX, setUserLocationX] = useState(
    partialSample?.userLocation.x
  );
  const [userLocationY, setUserLocationY] = useState(
    partialSample?.userLocation.y
  );
  const [sampledAt, setSampledAt] = useState(
    partialSample?.sampledAt ?? new Date()
  );
  const [department, setDepartment] = useState(partialSample?.department);

  const [createSample] = useCreateSampleMutation();
  const [updateSample] = useUpdateSampleMutation();

  const Form = SampleToCreate.omit({ userLocation: true }).merge(
    z.object({
      userLocationX: z.number({
        required_error: 'Veuillez renseigner la latitude.',
        invalid_type_error: 'Latitude invalide.',
      }),
      userLocationY: z.number({
        required_error: 'Veuillez renseigner la longitude.',
        invalid_type_error: 'Longitude invalide.',
      }),
    })
  );

  const form = useForm(Form, {
    userLocationX,
    userLocationY,
    sampledAt,
    resytalId,
    planningContext,
    legalContext,
    department,
  });

  type FormShape = typeof Form.shape;

  const planningContextOptions = selectOptionsFromList(
    SamplePlanningContextList,
    SamplePlanningContextLabels
  );

  const legalContextOptions = selectOptionsFromList(
    SampleLegalContextList,
    SampleLegalContextLabels
  );

  const departmentOptions = selectOptionsFromList(
    DepartmentList,
    DepartmentLabels
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await (partialSample
        ? updateSample({
            ...partialSample,
            userLocation: {
              x: userLocationX as number,
              y: userLocationY as number,
            },
            sampledAt: sampledAt as Date,
            resytalId: resytalId as string,
            planningContext: planningContext as SamplePlanningContext,
            legalContext: legalContext as SampleLegalContext,
            department: department as Department,
          })
        : createSample({
            userLocation: {
              x: userLocationX as number,
              y: userLocationY as number,
            },
            sampledAt: sampledAt as Date,
            resytalId: resytalId as string,
            planningContext: planningContext as SamplePlanningContext,
            legalContext: legalContext as SampleLegalContext,
            department: department as Department,
          })
      )
        .unwrap()
        .then((result) => {
          navigate(`/prelevements/${result.id}`, { replace: true });
        })
        .catch(() => {
          //TODO handle error
        });
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocationX(position.coords.latitude);
        setUserLocationY(position.coords.longitude);
      });
      //TODO how to force input updates
    }
  }, []);

  return (
    <form data-testid="draft_sample_1_form">
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppTextInput<FormShape>
            type="date"
            defaultValue={format(sampledAt, 'yyyy-MM-dd')}
            onChange={(e) =>
              setSampledAt(parse(e.target.value, 'yyyy-MM-dd', new Date()))
            }
            inputForm={form}
            inputKey="sampledAt"
            whenValid="Date de prélèvement correctement renseignée."
            data-testid="sampledAt-input"
            label="Date de prélèvement (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-6', 'fr-col-sm-2')}>
          <AppTextInput<FormShape>
            type="text"
            defaultValue={userLocationX ?? ''}
            onChange={(e) => setUserLocationX(parseFloat(e.target.value))}
            inputForm={form}
            inputKey="userLocationX"
            whenValid="Latitude correctement renseignée."
            data-testid="userLocationX-input"
            label="Latitude (Obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-6', 'fr-col-sm-2')}>
          <AppTextInput<FormShape>
            type="text"
            defaultValue={userLocationY ?? ''}
            onChange={(e) => setUserLocationY(parseFloat(e.target.value))}
            inputForm={form}
            inputKey="userLocationY"
            whenValid="Longitude correctement renseignée."
            data-testid="userLocationY-input"
            label="Longitude (Obligatoire)"
            required
          />
        </div>
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={partialSample?.department || ''}
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
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={partialSample?.planningContext || ''}
            options={planningContextOptions}
            onChange={(e) =>
              setPlanningContext(e.target.value as SamplePlanningContext)
            }
            inputForm={form}
            inputKey="planningContext"
            whenValid="Contexte correctement renseigné."
            data-testid="planning-context-select"
            label="Contexte (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={partialSample?.legalContext || ''}
            options={legalContextOptions}
            onChange={(e) =>
              setLegalContext(e.target.value as SampleLegalContext)
            }
            inputForm={form}
            inputKey="legalContext"
            whenValid="Cadre juridique correctement renseigné."
            data-testid="legal-context-select"
            label="Cadre juridique (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppTextInput<FormShape>
            type="text"
            defaultValue={partialSample?.resytalId || ''}
            onChange={(e) => setResytalId(e.target.value)}
            inputForm={form}
            inputKey="resytalId"
            whenValid="Identifiant Resytal correctement renseigné."
            data-testid="resytalId-input"
            label="Identifiant Resytal (obligatoire)"
            hintText="Format 22XXXXXX"
            required
          />
        </div>
        {/*{form.hasIssue('userLocation') && (*/}
        {/*  <div className={cx('fr-col-12')}>*/}
        {/*    <Alert*/}
        {/*      description="Pour pouvoir continuer, veuillez autoriser le navigateur à accéder à votre position."*/}
        {/*      severity="error"*/}
        {/*      title="Géolocalisation non disponible."*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />

      <div className={cx('fr-col-12')}>
        <Button data-testid="submit-button" onClick={submit}>
          {partialSample
            ? 'Enregistrer les modifications'
            : ' Créer le prélèvement'}
        </Button>
      </div>
    </form>
  );
};

export default SampleFormStep1;
