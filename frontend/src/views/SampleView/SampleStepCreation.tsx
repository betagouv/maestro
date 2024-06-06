import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Notice from '@codegouvfr/react-dsfr/Notice';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/referential/Department';
import {
  LegalContext,
  LegalContextLabels,
  LegalContextList,
} from 'shared/referential/LegalContext';
import { Regions } from 'shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import {
  DefaultAppSelectOption,
  selectOptionsFromList,
} from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
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

const SampleStepCreation = ({ partialSample }: Props) => {
  const navigate = useNavigate();
  const { userInfos } = useAuthentication();

  const OutsideProgrammingId = 'OutsideProgramming';
  const [resytalId, setResytalId] = useState(partialSample?.resytalId);
  const [programmingPlanId, setProgrammingPlanId] = useState(
    partialSample ? partialSample.programmingPlanId ?? OutsideProgrammingId : ''
  );
  const [legalContext, setLegalContext] = useState(partialSample?.legalContext);
  const [geolocationX, setGeolocationX] = useState(
    partialSample?.geolocation.x
  );
  const [geolocationY, setGeolocationY] = useState(
    partialSample?.geolocation.y
  );
  const [isBrowserGeolocation, setIsBrowserGeolocation] = useState(false);
  const [sampledAt, setSampledAt] = useState(
    format(partialSample?.sampledAt ?? new Date(), 'yyyy-MM-dd HH:mm')
  );

  const [department, setDepartment] = useState(partialSample?.department);
  const [commentCreation, setCommentCreation] = useState(
    partialSample?.commentCreation
  );

  const { data: programmingPlans } = useFindProgrammingPlansQuery({
    status: 'Validated',
  });
  const [createSample] = useCreateSampleMutation();
  const [updateSample] = useUpdateSampleMutation();

  const Form = SampleToCreate.omit({ geolocation: true }).merge(
    z.object({
      geolocationX: z.number({
        required_error: 'Veuillez renseigner la latitude.',
        invalid_type_error: 'Latitude invalide.',
      }),
      geolocationY: z.number({
        required_error: 'Veuillez renseigner la longitude.',
        invalid_type_error: 'Longitude invalide.',
      }),
    })
  );

  const form = useForm(Form, {
    geolocationX,
    geolocationY,
    sampledAt,
    resytalId,
    programmingPlanId:
      programmingPlanId === OutsideProgrammingId
        ? undefined
        : programmingPlanId,
    legalContext,
    department,
    commentCreation,
  });

  type FormShape = typeof Form.shape;

  const programmingPlanOptions = [
    DefaultAppSelectOption,
    ...(programmingPlans ?? []).map(({ id, kind }) => ({
      label: ProgrammingPlanKindLabels[kind],
      value: id,
    })),
    {
      label: 'Hors programmation',
      value: OutsideProgrammingId,
    },
  ];

  const legalContextOptions = selectOptionsFromList(LegalContextList, {
    labels: LegalContextLabels,
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
          status: 'DraftCompany',
        });
        navigate(`/prelevements/${partialSample.id}`, { replace: true });
      } else {
        await createSample({
          geolocation: {
            x: geolocationX as number,
            y: geolocationY as number,
          },
          sampledAt: parse(sampledAt, 'yyyy-MM-dd HH:mm', new Date()),
          resytalId: resytalId as string,
          programmingPlanId:
            (programmingPlanId as string) === OutsideProgrammingId
              ? undefined
              : (programmingPlanId as string),
          legalContext: legalContext as LegalContext,
          department: department as Department,
          commentCreation,
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
        geolocation: {
          x: geolocationX as number,
          y: geolocationY as number,
        },
        sampledAt: parse(sampledAt, 'yyyy-MM-dd', new Date()),
        resytalId: resytalId as string,
        programmingPlanId:
          (programmingPlanId as string) === OutsideProgrammingId
            ? null
            : (programmingPlanId as string),
        legalContext: legalContext as LegalContext,
        department: department as Department,
        commentCreation,
        ...data,
      });
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (!geolocationX && !geolocationY) {
          setGeolocationX(position.coords.latitude);
          setGeolocationY(position.coords.longitude);
        }
        setIsBrowserGeolocation(true);
      });
    } else {
      setIsBrowserGeolocation(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      data-testid="draft_sample_creation_form"
      onChange={async (e) => {
        e.preventDefault();
        await save();
      }}
    >
      {!isBrowserGeolocation && (
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
            type="datetime-local"
            defaultValue={sampledAt}
            onChange={(e) => setSampledAt(e.target.value)}
            inputForm={form}
            inputKey="sampledAt"
            whenValid="Date et heure de prélèvement correctement renseignés."
            data-testid="sampledAt-input"
            label="Date et heure de prélèvement (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-5', 'fr-col-sm-2')}>
          <AppTextInput<FormShape>
            type="text"
            value={geolocationX ?? ''}
            onChange={(e) =>
              setGeolocationX(
                isNaN(parseFloat(e.target.value))
                  ? undefined
                  : parseFloat(e.target.value)
              )
            }
            inputForm={form}
            inputKey="geolocationX"
            whenValid="Latitude correctement renseignée."
            data-testid="geolocationX-input"
            label="Latitude (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-5', 'fr-col-sm-2')}>
          <AppTextInput<FormShape>
            type="text"
            value={geolocationY ?? ''}
            onChange={(e) =>
              setGeolocationY(
                isNaN(parseFloat(e.target.value))
                  ? undefined
                  : parseFloat(e.target.value)
              )
            }
            inputForm={form}
            inputKey="geolocationY"
            whenValid="Longitude correctement renseignée."
            data-testid="geolocationY-input"
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
              geolocationX && geolocationY
                ? { x: geolocationX, y: geolocationY }
                : undefined
            }
            onLocationChange={async (location) => {
              setGeolocationX(location.x);
              setGeolocationY(location.y);
              await save({
                geolocation: {
                  x: location.x,
                  y: location.y,
                },
              });
            }}
            key={`geolocation-${isBrowserGeolocation}`}
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
            value={programmingPlanId}
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
            onChange={(e) => setLegalContext(e.target.value as LegalContext)}
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
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput<FormShape>
            rows={3}
            defaultValue={commentCreation ?? ''}
            onChange={(e) => setCommentCreation(e.target.value)}
            inputForm={form}
            inputKey="commentCreation"
            whenValid="Commentaire correctement renseigné."
            data-testid="comment-input"
            label="Commentaires"
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

export default SampleStepCreation;
