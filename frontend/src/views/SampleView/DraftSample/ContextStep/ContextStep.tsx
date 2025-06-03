import Alert from '@codegouvfr/react-dsfr/Alert';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import { isNil } from 'lodash-es';
import {
  LegalContext,
  LegalContextLabels,
  LegalContextList
} from 'maestro-shared/referential/LegalContext';
import { Company } from 'maestro-shared/schema/Company/Company';
import {
  Context,
  ContextLabels,
  OutsideProgrammingPlanContext,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isOutsideProgrammingPlanSample,
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
  SampleContextData,
  Sampler
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import {
  UserRoleList,
  UserRolePermissions
} from 'maestro-shared/schema/User/UserRole';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import balance from 'src/assets/illustrations/balance.svg';
import check from 'src/assets/illustrations/check.svg';
import controle from 'src/assets/illustrations/controle.svg';
import leaf from 'src/assets/illustrations/leaf.svg';
import warning from 'src/assets/illustrations/warning.svg';
import CompanySearch from 'src/components/CompanySearch/CompanySearch';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import {
  samplersOptions,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useOnLine } from 'src/hooks/useOnLine';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useCreateOrUpdateSampleMutation } from 'src/services/sample.service';
import SampleGeolocation from 'src/views/SampleView/DraftSample/ContextStep/SampleGeolocation';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod/v4';
import AppServiceErrorAlert from '../../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSelect from '../../../../components/_app/AppSelect/AppSelect';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import { useFindUsersQuery } from '../../../../services/user.service';
import NextButton from '../NextButton';

interface Props {
  programmingPlan: ProgrammingPlan;
  partialSample?: PartialSample | PartialSampleToCreate;
}

const ContextStep = ({ programmingPlan, partialSample }: Props) => {
  const { navigateToSample, navigateToSamples } = useSamplesLink();
  const { isOnline } = useOnLine();
  const { readonly } = usePartialSample(partialSample);
  const { trackEvent } = useAnalytics();
  const { user } = useAuthentication();

  const [resytalId, setResytalId] = useState(partialSample?.resytalId);
  const [context, setContext] = useState<
    ProgrammingPlanContext | 'OutsideProgrammingPlan' | undefined
  >(
    isOutsideProgrammingPlanSample(partialSample)
      ? 'OutsideProgrammingPlan'
      : ProgrammingPlanContext.safeParse(partialSample?.context).data
  );
  const [outsideProgrammingPlanContext, setOutsideProgrammingPlanContext] =
    useState<OutsideProgrammingPlanContext | undefined>(
      isOutsideProgrammingPlanSample(partialSample)
        ? OutsideProgrammingPlanContext.safeParse(partialSample?.context).data
        : undefined
    );
  const [programmingPlanKind, setProgrammingPlanKind] = useState(
    partialSample?.specificData.programmingPlanKind ?? ''
  );
  const [legalContext, setLegalContext] = useState(partialSample?.legalContext);
  const [geolocationX, setGeolocationX] = useState(
    partialSample?.geolocation?.x
  );
  const [geolocationY, setGeolocationY] = useState(
    partialSample?.geolocation?.y
  );
  const [isBrowserGeolocation, setIsBrowserGeolocation] = useState(false);
  const [sampledAt, setSampledAt] = useState(
    format(partialSample?.sampledAt ?? new Date(), 'yyyy-MM-dd HH:mm')
  );
  const [sampler, setSampler] = useState<Sampler | undefined>(
    partialSample?.sampler ?? user
  );

  const [parcel, setParcel] = useState(partialSample?.parcel);
  const [company, setCompany] = useState(partialSample?.company);
  const [companyOffline, setCompanyOffline] = useState(
    partialSample?.companyOffline
  );
  const [notesOnCreation, setNotesOnCreation] = useState(
    partialSample?.notesOnCreation
  );
  const isSubmittingRef = useRef<boolean>(false);

  const [createOrUpdateSample, createOrUpdateSampleCall] =
    useCreateOrUpdateSampleMutation();

  useEffect(() => {
    if (programmingPlan.kinds.length === 1) {
      setProgrammingPlanKind(programmingPlan.kinds[0]);
    }
  }, [programmingPlan]);

  const specificData = useMemo(() => {
    const kind = partialSample?.specificData?.programmingPlanKind;
    if (programmingPlanKind !== kind) {
      return { programmingPlanKind };
    } else {
      return partialSample?.specificData;
    }
  }, [programmingPlanKind, partialSample?.specificData]);

  const { data: samplers } = useFindUsersQuery({
    region: user?.region,
    roles: UserRoleList.filter((r) => {
      const permissions = UserRolePermissions[r];
      return (
        permissions.includes('createSample') ||
        permissions.includes('updateSample')
      );
    })
  });

  const Form = SampleContextData.omit({
    programmingPlanId: true,
    geolocation: true,
    company: true,
    context: true,
    department: true
  })
    .extend({
      geolocationX: z.number({
        error: (issue) => {
          return isNil(issue.input)
            ? 'Veuillez renseigner la latitude.'
            : 'Latitude invalide.';
        }
      }),
      geolocationY: z.number({
        error: (issue) => {
          return isNil(issue.input)
            ? 'Veuillez renseigner la longitude.'
            : 'Latitude invalide.';
        }
      })
    })
    .partial(!isOnline ? { geolocationX: true, geolocationY: true } : {})
    .extend({
      context: z.enum(
        [...ProgrammingPlanContext.options, 'OutsideProgrammingPlan'],
        {
          error: (issue) =>
            isNil(issue.input)
              ? 'Veuillez renseigner le contexte.'
              : issue.message
        }
      ),
      outsideProgrammingPlanContext:
        context === 'OutsideProgrammingPlan' ? Context : z.undefined()
    })
    .extend(
      isOnline
        ? { company: Company }
        : {
            companyOffline: z.string({
              error: (issue) =>
                isNil(issue.input)
                  ? "Veuillez renseigner l'entité contrôlée."
                  : issue.message
            })
          }
    );

  const contextOptions = selectOptionsFromList(
    [...(programmingPlan.contexts ?? []), 'OutsideProgrammingPlan'],
    {
      labels: {
        ...ContextLabels,
        OutsideProgrammingPlan: 'Hors programmation'
      },
      withDefault: false,
      withSort: false
    }
  );

  const outsideProgrammingPlanContextOptions = selectOptionsFromList(
    OutsideProgrammingPlanContext.options,
    {
      labels: ContextLabels,
      withDefault: true,
      withSort: true
    }
  );

  const ContextIllustrations: Record<
    ProgrammingPlanContext | 'OutsideProgrammingPlan',
    any
  > = {
    Control: check,
    Surveillance: leaf,
    OutsideProgrammingPlan: warning
  };

  const legalContextOptions = selectOptionsFromList(LegalContextList, {
    labels: LegalContextLabels,
    withDefault: false
  });

  const programmingPlanKindOptions = selectOptionsFromList(
    programmingPlan.kinds ?? [],
    {
      labels: ProgrammingPlanKindLabels,
      withDefault: true,
      withSort: true
    }
  );

  const id = useMemo(() => partialSample?.id ?? uuidv4(), [partialSample]);

  const formData = {
    id,
    sampledAt: parse(sampledAt, 'yyyy-MM-dd HH:mm', new Date()),
    sampler: sampler as Sampler,
    geolocation:
      geolocationX && geolocationY
        ? {
            x: geolocationX as number,
            y: geolocationY as number
          }
        : undefined,
    parcel,
    programmingPlanId: programmingPlan.id as string,
    context:
      context === 'OutsideProgrammingPlan'
        ? outsideProgrammingPlanContext
        : context,
    legalContext: legalContext as LegalContext,
    company,
    companyOffline,
    resytalId: resytalId as string,
    notesOnCreation,
    status: 'Draft' as const,
    specificData: specificData as PartialSampleMatrixSpecificData
  };

  useEffect(
    () => {
      if (isSubmittingRef.current && !createOrUpdateSampleCall.isLoading) {
        isSubmittingRef.current = false;

        if (createOrUpdateSampleCall.isSuccess) {
          trackEvent('sample', `submit_${formData.status}`, formData.id);
          navigateToSample(formData.id);
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      createOrUpdateSampleCall.isSuccess,
      createOrUpdateSampleCall.isLoading,
      formData.id
    ]
  );

  const submit = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    await form.validate(async () => {
      isSubmittingRef.current = true;
      await createOrUpdateSample({
        ...partialSample,
        ...formData,
        status: 'DraftMatrix'
      });
    });
  };

  const save = async (status = partialSample?.status) => {
    if (partialSample) {
      createOrUpdateSample({
        ...partialSample,
        ...formData,
        status: status as SampleStatus
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
        trackEvent('geolocation', 'enable');
      });
    } else {
      setIsBrowserGeolocation(false);
      trackEvent('geolocation', 'disable');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formInput = {
    id,
    sampledAt,
    sampler,
    geolocationX,
    geolocationY,
    parcel,
    context,
    outsideProgrammingPlanContext,
    legalContext,
    company,
    companyOffline,
    resytalId,
    notesOnCreation,
    status: 'DraftMatrix',
    specificData
  };

  const form = useForm(Form, formInput, save);

  return (
    <form data-testid="draft_sample_creation_form" className="sample-form">
      {!isBrowserGeolocation && !readonly && (
        <Alert
          severity="info"
          title=""
          small
          closable
          description={`Autorisez le partage de votre position pour faciliter la localisation 
            ${programmingPlanKind === 'PPV' ? ' de la parcelle' : ' du contrôle'}.`}
        />
      )}
      <AppRequiredText />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-8')}>
          <AppTextInput
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
            disabled={readonly}
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect<FormShape>
            defaultValue={partialSample?.sampler?.id || ''}
            options={samplersOptions(samplers, user?.id)}
            onChange={(e) =>
              setSampler(
                samplers?.find((sampler) => sampler.id === e.target.value)
              )
            }
            inputForm={form}
            inputKey="sampledBy"
            whenValid="Préleveur correctement renseigné."
            label="Le préleveur"
            hint="La personne qui réalise le prélevement"
            required
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-pb-0')}>
          <div className={cx('fr-text--bold')}>
            Emplacement{' '}
            {programmingPlanKind === 'PPV'
              ? 'de la parcelle contrôlée'
              : 'du contrôle'}
          </div>
          <div className={cx('fr-text--light')}>
            Placez votre repère sur la zone correspondante ou renseignez
            manuellement les coordonnées GPS
          </div>
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-8')}>
          {isOnline && !readonly ? (
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
          ) : (
            <Skeleton variant="rectangular" height={375} />
          )}
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppTextInput
                type="number"
                step={0.000001}
                value={geolocationX ?? ''}
                onChange={(e) => setGeolocationX(Number(e.target.value))}
                inputForm={form}
                inputKey="geolocationX"
                whenValid="Latitude correctement renseignée."
                data-testid="geolocationX-input"
                label="Latitude"
                required={isOnline}
                min={-90}
                max={90}
                disabled={readonly}
              />
            </div>
            <div className={cx('fr-col-12')}>
              <AppTextInput
                type="number"
                step={0.000001}
                value={geolocationY ?? ''}
                onChange={(e) => setGeolocationY(Number(e.target.value))}
                inputForm={form}
                inputKey="geolocationY"
                whenValid="Longitude correctement renseignée."
                data-testid="geolocationY-input"
                label="Longitude"
                required={isOnline}
                min={-180}
                max={180}
                disabled={readonly}
              />
            </div>
            {programmingPlanKind === 'PPV' && (
              <div className={cx('fr-col-12')}>
                <AppTextInput
                  defaultValue={parcel ?? ''}
                  onChange={(e) => setParcel(e.target.value)}
                  inputForm={form}
                  inputKey="parcel"
                  whenValid="Parcelle correctement renseignée."
                  data-testid="parcel-input"
                  label="N° ou appellation de la parcelle"
                  hintText="Facultatif"
                  disabled={readonly}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {programmingPlanKindOptions.length > 2 && (
        <AppSelect
          defaultValue={programmingPlanKind}
          options={programmingPlanKindOptions}
          onChange={(e) =>
            setProgrammingPlanKind(e.target.value as ProgrammingPlanKind)
          }
          inputForm={form}
          inputKey="specificData"
          inputPathFromKey={['programmingPlanKind']}
          whenValid="Type de plan correctement renseigné."
          data-testid="programmingPlanKind-select"
          label="Type de plan"
          disabled={readonly}
          required
          className={cx('fr-mb-0')}
        />
      )}
      <AppRadioButtons
        legend="Contexte du prélèvement"
        options={[
          ...contextOptions.map(({ label, value }) => ({
            key: `context-option-${value}`,
            label,
            nativeInputProps: {
              checked: context === value,
              onChange: () => {
                setContext(
                  value as ProgrammingPlanContext | 'OutsideProgrammingPlan'
                );
                if (value !== 'OutsideProgrammingPlan') {
                  setOutsideProgrammingPlanContext(undefined);
                }
              }
            },
            illustration: (
              <img
                src={
                  ContextIllustrations[
                    value as ProgrammingPlanContext | 'OutsideProgrammingPlan'
                  ]
                }
                alt=""
                aria-hidden
              />
            )
          }))
        ]}
        colSm={6}
        inputForm={form}
        inputKey="context"
        whenValid="Contexte du prélèvement correctement renseigné."
        required
        disabled={readonly}
        data-testid="context-radio"
      />
      {context === 'OutsideProgrammingPlan' && (
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect
            defaultValue={outsideProgrammingPlanContext}
            options={outsideProgrammingPlanContextOptions}
            onChange={(e) =>
              setOutsideProgrammingPlanContext(
                e.target.value as OutsideProgrammingPlanContext
              )
            }
            inputForm={form}
            inputKey="outsideProgrammingPlanContext"
            whenValid="Précision du contexte du prélèvement correctement renseignée."
            label="Précision du contexte hors programmation"
            disabled={readonly}
            required
            className={cx('fr-mb-0')}
          />
        </div>
      )}
      <AppRadioButtons
        legend="Cadre juridique"
        options={
          legalContextOptions?.map(({ label, value }) => ({
            key: `legalContext-option-${value}`,
            label,
            nativeInputProps: {
              checked: legalContext === value,
              onChange: () => setLegalContext(value as LegalContext)
            },
            illustration: (
              <img
                src={value === 'B' ? controle : balance}
                alt=""
                aria-hidden
              />
            )
          })) ?? []
        }
        colSm={6}
        inputForm={form}
        inputKey="legalContext"
        whenValid="Cadre juridique correctement renseigné."
        required
        disabled={readonly}
        data-testid="legalContext-radio"
      />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {isOnline && companyOffline && !company && (
          <div
            className={cx(
              'fr-col-12',
              'fr-col-sm-6',
              'fr-col-offset-sm-6--right'
            )}
          >
            <span className="missing-data">
              Entité saisie hors ligne à compléter :{' '}
            </span>
            {companyOffline}
          </div>
        )}
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          {isOnline && !readonly ? (
            <CompanySearch
              initialCompany={company ?? undefined}
              onSelectCompany={(result) => {
                setCompany(result);
              }}
              state={form.messageType('company')}
              stateRelatedMessage={
                form.message('company') ?? 'Entité correctement renseignée'
              }
            />
          ) : (
            <AppTextInput
              type="text"
              defaultValue={companyOffline ?? ''}
              onChange={(e) => setCompanyOffline(e.target.value)}
              inputForm={form}
              inputKey="companyOffline"
              whenValid="Entité correctement renseignée."
              label="Entité contrôlée"
              hintText="Saisissez le nom, un SIRET ou un SIREN"
              required
              disabled={readonly}
            />
          )}
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppTextInput
            type="text"
            defaultValue={partialSample?.resytalId || ''}
            onChange={(e) => setResytalId(e.target.value)}
            inputForm={form}
            inputKey="resytalId"
            whenValid="Identifiant Resytal correctement renseigné."
            data-testid="resytalId-input"
            label="Identifiant Resytal"
            disabled={readonly}
            hintText="Format AA-XXXXXX"
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput
            rows={1}
            defaultValue={notesOnCreation ?? ''}
            onChange={(e) => setNotesOnCreation(e.target.value)}
            inputForm={form}
            inputKey="notesOnCreation"
            whenValid="Note correctement renseignée."
            data-testid="notes-input"
            label="Note additionnelle"
            hintText="Champ facultatif pour identification et qualité de la personne présente lors du contrôle"
            disabled={readonly}
          />
        </div>
      </div>
      <hr className={cx('fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={clsx(cx('fr-col-12'), 'sample-actions')}>
          {!readonly ? (
            <>
              <AppServiceErrorAlert call={createOrUpdateSampleCall} />
              <ButtonsGroup
                alignment="between"
                inlineLayoutWhen="md and up"
                buttons={[
                  {
                    children: 'Abandonner la saisie',
                    priority: 'tertiary',
                    onClick: navigateToSamples,
                    nativeButtonProps: {
                      'data-testid': 'cancel-button'
                    }
                  },
                  {
                    children: 'Continuer',
                    onClick: submit,
                    iconId: 'fr-icon-arrow-right-line',
                    iconPosition: 'right',
                    disabled: createOrUpdateSampleCall.isLoading,
                    nativeButtonProps: {
                      'data-testid': 'submit-button'
                    }
                  }
                ]}
              />
            </>
          ) : (
            <ul
              className={cx(
                'fr-btns-group',
                'fr-btns-group--inline-md',
                'fr-btns-group--right',
                'fr-btns-group--icon-left'
              )}
            >
              <li>
                <NextButton partialSample={partialSample} currentStep={1} />
              </li>
            </ul>
          )}
        </div>
        {isOnline && !readonly && (
          <SupportDocumentDownload partialSample={partialSample ?? formData} />
        )}
      </div>
    </form>
  );
};

export default ContextStep;
