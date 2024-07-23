import Alert from '@codegouvfr/react-dsfr/Alert';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
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
import {
  Company,
  companyFromSearchResult,
} from 'shared/schema/Company/Company';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import balance from 'src/assets/illustrations/balance.svg';
import controle from 'src/assets/illustrations/controle.svg';
import CompanySearch from 'src/components/CompanySearch/CompanySearch';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  useCreateSampleMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
import SampleGeolocation from 'src/views/SampleView/DraftSample/CreationStep/SampleGeolocation';
import { z } from 'zod';
import check from '../../../../assets/illustrations/check.svg';
import leaf from '../../../../assets/illustrations/leaf.svg';
interface Props {
  partialSample?: PartialSample;
}

const CreationStep = ({ partialSample }: Props) => {
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
  const [parcel, setParcel] = useState(partialSample?.parcel);
  const [company, setCompany] = useState(partialSample?.company);
  const [notesOnCreation, setNotesOnCreation] = useState(
    partialSample?.notesOnCreation
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

  type FormShape = typeof Form.shape;

  const departmentOptions = selectOptionsFromList(
    userInfos?.region ? Regions[userInfos.region].departments : DepartmentList,
    {
      labels: DepartmentLabels,
      defaultLabel: 'Sélectionner une zone',
    }
  );

  const programmingPlanOptions = [
    ...(programmingPlans ?? []).map(({ id, kind }) => ({
      label: ProgrammingPlanKindLabels[kind],
      value: id,
      illustration: kind === 'Control' ? check : leaf,
    })),
  ];

  const legalContextOptions = selectOptionsFromList(LegalContextList, {
    labels: LegalContextLabels,
    withDefault: false,
  });

  const formData = {
    sampledAt: parse(sampledAt, 'yyyy-MM-dd HH:mm', new Date()),
    department: department as Department,
    geolocation: {
      x: geolocationX as number,
      y: geolocationY as number,
    },
    parcel,
    programmingPlanId:
      (programmingPlanId as string) === OutsideProgrammingId
        ? undefined
        : (programmingPlanId as string),
    legalContext: legalContext as LegalContext,
    company: company as Company,
    resytalId: resytalId as string,
    notesOnCreation,
  };

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      if (partialSample) {
        await save('DraftMatrix');
        navigate(`/prelevements/${partialSample.id}`, { replace: true });
      } else {
        await createSample(formData)
          .unwrap()
          .then((result) => {
            navigate(`/prelevements/${result.id}`, { replace: true });
          });
      }
    });
  };

  const save = async (status = partialSample?.status) => {
    if (partialSample?.status) {
      await updateSample({
        ...partialSample,
        ...formData,
        status: status as SampleStatus,
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

  const form = useForm(
    Form,
    {
      sampledAt,
      department,
      geolocationX,
      geolocationY,
      parcel,
      programmingPlanId:
        programmingPlanId === OutsideProgrammingId
          ? undefined
          : programmingPlanId,
      legalContext,
      company,
      resytalId,
      notesOnCreation,
    },
    save
  );

  return (
    <form data-testid="draft_sample_creation_form" className="sample-form">
      {!isBrowserGeolocation && (
        <Alert
          severity="info"
          title=""
          small
          closable
          description="Autorisez le partage de votre position pour faciliter la localisation de la parcelle"
        />
      )}
      <AppRequiredText />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-8')}>
          <AppTextInput<FormShape>
            type="datetime-local"
            defaultValue={sampledAt}
            onChange={(e) => setSampledAt(e.target.value.replace('T', ' '))}
            inputForm={form}
            inputKey="sampledAt"
            whenValid="Date et heure de prélèvement correctement renseignés."
            data-testid="sampledAt-input"
            label="Date et heure de prélèvement"
            hintText="Format attendu › JJ/MM/AAAA HH:MM"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={partialSample?.department || ''}
            options={departmentOptions}
            onChange={(e) => setDepartment(e.target.value as Department)}
            inputForm={form}
            inputKey="department"
            whenValid="Département correctement renseigné."
            data-testid="department-select"
            label="Département"
            hint="Zone géographique de prélèvement"
            required
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-pb-0')}>
          <div className={cx('fr-text--bold')}>
            Emplacement de la parcelle contrôlée
          </div>
          <div className={cx('fr-text--light')}>
            Placez votre repère sur la zone correspondante ou renseignez
            manuellement les coordonnées GPS
          </div>
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-8')}>
          <SampleGeolocation
            key={`geolocation-${isBrowserGeolocation}`}
            location={
              geolocationX && geolocationY
                ? { x: geolocationX, y: geolocationY }
                : undefined
            }
            onLocationChange={async (location) => {
              setGeolocationX(location.x);
              setGeolocationY(location.y);
            }}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppTextInput<FormShape>
                type="number"
                step={0.000001}
                value={geolocationX ?? ''}
                onChange={(e) => setGeolocationX(Number(e.target.value))}
                inputForm={form}
                inputKey="geolocationX"
                whenValid="Latitude correctement renseignée."
                data-testid="geolocationX-input"
                label="Latitude"
                required
              />
            </div>
            <div className={cx('fr-col-12')}>
              <AppTextInput<FormShape>
                type="number"
                step={0.000001}
                value={geolocationY ?? ''}
                onChange={(e) => setGeolocationY(Number(e.target.value))}
                inputForm={form}
                inputKey="geolocationY"
                whenValid="Longitude correctement renseignée."
                data-testid="geolocationY-input"
                label="Longitude"
                required
              />
            </div>
            <div className={cx('fr-col-12')}>
              <AppTextInput<FormShape>
                defaultValue={parcel ?? ''}
                onChange={(e) => setParcel(e.target.value)}
                inputForm={form}
                inputKey="parcel"
                whenValid="Parcelle correctement renseignée."
                data-testid="parcel-input"
                label="N° ou appellation de la parcelle"
                hintText="Facultatif"
              />
            </div>
          </div>
        </div>
      </div>
      <AppRadioButtons<FormShape>
        legend="Contexte du prélèvement"
        options={
          programmingPlanOptions?.map(({ label, value, illustration }) => ({
            key: `programmingPlan-option-${value}`,
            label,
            nativeInputProps: {
              checked: programmingPlanId === value,
              onChange: () => setProgrammingPlanId(value),
            },
            illustration: <img src={illustration} alt="" aria-hidden />,
          })) ?? []
        }
        colSm={6}
        inputForm={form}
        inputKey="programmingPlanId"
        whenValid="Contexte du prélèvement correctement renseigné."
        required
        data-testid="programmingPlanId-radio"
      />
      <AppRadioButtons<FormShape>
        legend="Cadre juridique"
        options={
          legalContextOptions?.map(({ label, value }) => ({
            key: `legalContext-option-${value}`,
            label,
            nativeInputProps: {
              checked: legalContext === value,
              onChange: () => setLegalContext(value as LegalContext),
            },
            illustration: (
              <img
                src={value === 'B' ? controle : balance}
                alt=""
                aria-hidden
              />
            ),
          })) ?? []
        }
        colSm={6}
        inputForm={form}
        inputKey="legalContext"
        whenValid="Cadre juridique correctement renseigné."
        required
        data-testid="legalContext-radio"
      />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <CompanySearch
            department={department}
            onSelectCompany={(result) => {
              setCompany(result ? companyFromSearchResult(result) : undefined);
            }}
            state={form.messageType('company')}
            stateRelatedMessage={
              form.message('company') ?? 'Entité correctement renseignée'
            }
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppTextInput<FormShape>
            type="text"
            defaultValue={partialSample?.resytalId || ''}
            onChange={(e) => setResytalId(e.target.value)}
            inputForm={form}
            inputKey="resytalId"
            whenValid="Identifiant Resytal correctement renseigné."
            data-testid="resytalId-input"
            label="Identifiant Resytal"
            hintText="Format AA-XXXXXX"
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput<FormShape>
            rows={1}
            defaultValue={notesOnCreation ?? ''}
            onChange={(e) => setNotesOnCreation(e.target.value)}
            inputForm={form}
            inputKey="notesOnCreation"
            whenValid="Note correctement renseignée."
            data-testid="notes-input"
            label="Note additionnelle"
            hintText="Champ facultatif pour précisions supplémentaires"
          />
        </div>
      </div>
      <hr className={cx('fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={clsx(cx('fr-col-12'), 'sample-actions')}>
          <ButtonsGroup
            alignment="between"
            inlineLayoutWhen="md and up"
            buttons={[
              {
                children: 'Abandonner la saisie',
                priority: 'tertiary',
                onClick: (_) => navigate(`/prelevements`),
                nativeButtonProps: {
                  'data-testid': 'cancel-button',
                },
              },
              {
                children: 'Continuer',
                onClick: submit,
                iconId: 'fr-icon-arrow-right-line',
                iconPosition: 'right',
                nativeButtonProps: {
                  'data-testid': 'submit-button',
                },
              },
            ]}
          />
        </div>
      </div>
    </form>
  );
};

export default CreationStep;
