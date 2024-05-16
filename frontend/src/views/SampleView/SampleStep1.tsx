import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Notice from '@codegouvfr/react-dsfr/Notice';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/schema/Department';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { Regions } from 'shared/schema/Region';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import {
  SampleLegalContext,
  SampleLegalContextLabels,
  SampleLegalContextList,
} from 'shared/schema/Sample/SampleLegalContext';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import {
  DefaultAppSelectOption,
  selectOptionsFromList,
} from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  useCreateSampleMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
import SampleGeolocation from 'src/views/SampleView/SampleGeolocation';
import { z } from 'zod';

interface Props {
  partialSample?: PartialSample;
}

const SampleStep1 = ({ partialSample }: Props) => {
  const navigate = useNavigate();
  const { userInfos } = useAuthentication();

  const [resytalId, setResytalId] = useState(partialSample?.resytalId);
  const [programmingPlanId, setProgrammingPlanId] = useState(
    partialSample?.programmingPlanId
  );
  const [legalContext, setLegalContext] = useState(partialSample?.legalContext);
  const [userLocationX, setUserLocationX] = useState(
    partialSample?.userLocation.x
  );
  const [userLocationY, setUserLocationY] = useState(
    partialSample?.userLocation.y
  );
  const [isUserLocationFromGeolocation, setIsUserLocationFromGeolocation] =
    useState(false);
  const [sampledAt, setSampledAt] = useState(
    format(partialSample?.sampledAt ?? new Date(), 'yyyy-MM-dd')
  );
  const [department, setDepartment] = useState(partialSample?.department);

  const { data: programmingPlans } = useFindProgrammingPlansQuery({
    status: 'Validated',
  });
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
    programmingPlanId,
    legalContext,
    department,
  });

  type FormShape = typeof Form.shape;

  const programmingPlanOptions = [
    DefaultAppSelectOption,
    ...(programmingPlans ?? []).map(({ id, kind }) => ({
      label: ProgrammingPlanKindLabels[kind],
      value: id,
    })),
  ];

  const legalContextOptions = selectOptionsFromList(SampleLegalContextList, {
    labels: SampleLegalContextLabels,
  });

  const departmentOptions = selectOptionsFromList(
    userInfos?.region ? Regions[userInfos.region].departments : DepartmentList,
    {
      labels: DepartmentLabels,
    }
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      if (partialSample) {
        await save({
          status: 'DraftInfos',
        });
        navigate(`/prelevements/${partialSample.id}`, { replace: true });
      } else {
        await createSample({
          userLocation: {
            x: userLocationX as number,
            y: userLocationY as number,
          },
          sampledAt: parse(sampledAt, 'yyyy-MM-dd', new Date()),
          resytalId: resytalId as string,
          programmingPlanId: programmingPlanId as string,
          legalContext: legalContext as SampleLegalContext,
          department: department as Department,
        })
          .unwrap()
          .then((result) => {
            navigate(`/prelevements/${result.id}`, { replace: true });
          });
      }
    });
  };

  const save = async (data?: Partial<PartialSample>) => {
    if (partialSample) {
      await updateSample({
        ...partialSample,
        userLocation: {
          x: userLocationX as number,
          y: userLocationY as number,
        },
        sampledAt: parse(sampledAt, 'yyyy-MM-dd', new Date()),
        resytalId: resytalId as string,
        programmingPlanId: programmingPlanId as string,
        legalContext: legalContext as SampleLegalContext,
        department: department as Department,
        ...data,
      });
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (!userLocationX && !userLocationY) {
          setUserLocationX(position.coords.latitude);
          setUserLocationY(position.coords.longitude);
        }
        setIsUserLocationFromGeolocation(true);
      });
    } else {
      setIsUserLocationFromGeolocation(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      data-testid="draft_sample_1_form"
      onChange={async (e) => {
        e.preventDefault();
        await save();
      }}
    >
      {!isUserLocationFromGeolocation && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-p-0', 'fr-mb-2w')}>
            <Notice
              isClosable
              title="Vous pouvez renseigner automatiquement la latitude et la longitude en
          autorisant le navigateur à accéder à votre position."
              className={cx('fr-py-1w')}
            />
          </div>
        </div>
      )}
      <div
        className={cx(
          'fr-grid-row',
          'fr-grid-row--gutters',
          'fr-pb-1w',
          'fr-mb-2w'
        )}
        style={{
          backgroundColor: fr.colors.decisions.background.disabled.grey.default,
        }}
      >
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppTextInput<FormShape>
            type="date"
            defaultValue={sampledAt}
            onChange={(e) => setSampledAt(e.target.value)}
            inputForm={form}
            inputKey="sampledAt"
            whenValid="Date de prélèvement correctement renseignée."
            data-testid="sampledAt-input"
            label="Date de prélèvement (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-5', 'fr-col-sm-2')}>
          <AppTextInput<FormShape>
            type="text"
            value={userLocationX ?? ''}
            onChange={(e) =>
              setUserLocationX(
                isNaN(parseFloat(e.target.value))
                  ? undefined
                  : parseFloat(e.target.value)
              )
            }
            inputForm={form}
            inputKey="userLocationX"
            whenValid="Latitude correctement renseignée."
            data-testid="userLocationX-input"
            label="Latitude (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-5', 'fr-col-sm-2')}>
          <AppTextInput<FormShape>
            type="text"
            value={userLocationY ?? ''}
            onChange={(e) =>
              setUserLocationY(
                isNaN(parseFloat(e.target.value))
                  ? undefined
                  : parseFloat(e.target.value)
              )
            }
            inputForm={form}
            inputKey="userLocationY"
            whenValid="Longitude correctement renseignée."
            data-testid="userLocationY-input"
            label="Longitude (obligatoire)"
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
          <SampleGeolocation
            sampleId={partialSample?.id}
            location={
              userLocationX && userLocationY
                ? { x: userLocationX, y: userLocationY }
                : undefined
            }
            onLocationChange={async (location) => {
              setUserLocationX(location.x);
              setUserLocationY(location.y);
              await save({
                userLocation: {
                  x: location.x,
                  y: location.y,
                },
              });
            }}
            key={`geolocation-${isUserLocationFromGeolocation}`}
          />
        </div>
      </div>
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
            defaultValue={partialSample?.programmingPlanId || ''}
            options={programmingPlanOptions}
            onChange={(e) => setProgrammingPlanId(e.target.value)}
            inputForm={form}
            inputKey="programmingPlanId"
            whenValid="Contexte correctement renseigné."
            data-testid="programming-plan-id-select"
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
            label="Identifiant Resytal"
            hintText="Format 22XXXXXX"
          />
        </div>
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />

      <div className={cx('fr-col-12')}>
        <Button data-testid="submit-button" onClick={submit}>
          Etape suivante
        </Button>
      </div>
    </form>
  );
};

export default SampleStep1;
