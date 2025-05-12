import Alert from '@codegouvfr/react-dsfr/Alert';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import { Department } from 'maestro-shared/referential/Department';
import {
  LegalContext,
  LegalContextLabels,
  LegalContextList
} from 'maestro-shared/referential/LegalContext';
import { Company } from 'maestro-shared/schema/Company/Company';
import {
  Context,
  ContextLabels
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
  SampleContextData
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import React, { useEffect, useMemo, useState } from 'react';
import balance from 'src/assets/illustrations/balance.svg';
import check from 'src/assets/illustrations/check.svg';
import controle from 'src/assets/illustrations/controle.svg';
import leaf from 'src/assets/illustrations/leaf.svg';
import CompanySearch from 'src/components/CompanySearch/CompanySearch';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useOnLine } from 'src/hooks/useOnLine';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useAppSelector } from 'src/hooks/useStore';
import { useCreateOrUpdateSampleMutation } from 'src/services/sample.service';
import SampleGeolocation from 'src/views/SampleView/DraftSample/ContextStep/SampleGeolocation';
import SupportDocumentDownload from 'src/views/SampleView/DraftSample/SupportDocumentDownload';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import AppSelect from '../../../../components/_app/AppSelect/AppSelect';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import NextButton from '../NextButton';

interface Props {
  partialSample?: PartialSample | PartialSampleToCreate;
}

const ContextStep = ({ partialSample }: Props) => {
  const { navigateToSample, navigateToSamples } = useSamplesLink();
  const { isOnline } = useOnLine();
  const { readonly } = usePartialSample(partialSample);

  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const [resytalId, setResytalId] = useState(partialSample?.resytalId);
  const [context, setContext] = useState(partialSample?.context);
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

  const [parcel, setParcel] = useState(partialSample?.parcel);
  const [company, setCompany] = useState(partialSample?.company);
  const [companyOffline, setCompanyOffline] = useState(
    partialSample?.companyOffline
  );
  const [notesOnCreation, setNotesOnCreation] = useState(
    partialSample?.notesOnCreation
  );

  const [hasError, setHasError] = useState<boolean>(false);
  const [createOrUpdateSample] = useCreateOrUpdateSampleMutation();

  const geolocation = z.object({
    geolocationX: z.number({
      required_error: 'Veuillez renseigner la latitude.',
      invalid_type_error: 'Latitude invalide.'
    }),
    geolocationY: z.number({
      required_error: 'Veuillez renseigner la longitude.',
      invalid_type_error: 'Longitude invalide.'
    })
  });

  useEffect(() => {
    if (programmingPlan?.contexts.length === 1) {
      setContext(programmingPlan?.contexts[0]);
    }
    if (programmingPlan?.kinds.length === 1) {
      setProgrammingPlanKind(programmingPlan?.kinds[0]);
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

  const Form = SampleContextData.omit({
    programmingPlanId: true,
    geolocation: true,
    company: true
  })
    .merge(isOnline ? geolocation : geolocation.partial())
    .extend(
      isOnline
        ? { company: Company }
        : {
            companyOffline: z.string({
              required_error: "Veuillez renseigner l'entité contrôlée."
            })
          }
    );

  type FormShape = typeof Form.shape;

  const contextOptions = selectOptionsFromList(
    programmingPlan?.contexts ?? [],
    {
      labels: ContextLabels,
      withDefault: false,
      withSort: true
    }
  );

  const legalContextOptions = selectOptionsFromList(LegalContextList, {
    labels: LegalContextLabels,
    withDefault: false
  });

  const programmingPlanKindOptions = selectOptionsFromList(
    programmingPlan?.kinds ?? [],
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
    department: company?.postalCode?.slice(0, 2) as Department,
    geolocation:
      geolocationX && geolocationY
        ? {
            x: geolocationX as number,
            y: geolocationY as number
          }
        : undefined,
    parcel,
    programmingPlanId: programmingPlan?.id as string,
    context: context as Context,
    legalContext: legalContext as LegalContext,
    company,
    companyOffline,
    resytalId: resytalId as string,
    notesOnCreation,
    status: 'Draft' as const,
    specificData: specificData as PartialSampleMatrixSpecificData
  };

  const submit = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    await form.validate(async () => {
      setHasError(false);
      try {
        if (partialSample) {
          await save('DraftMatrix');
        } else {
          await createOrUpdateSample({
            ...formData,
            status: 'DraftMatrix'
          }).unwrap();
        }
      } catch (e) {
        console.log('error', e);
        setHasError(true);

        return;
      }
      navigateToSample(formData.id);
    });
  };

  const save = async (status = partialSample?.status) => {
    if (partialSample) {
      return createOrUpdateSample({
        ...partialSample,
        ...formData,
        status: status as SampleStatus
      }).unwrap();
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

  const formInput = {
    id,
    sampledAt,
    department: company?.postalCode?.slice(0, 2) as Department,
    geolocationX,
    geolocationY,
    parcel,
    context,
    legalContext,
    company,
    companyOffline,
    resytalId,
    notesOnCreation,
    status: 'DraftMatrix',
    specificData
  };

  const form = useForm(Form, formInput);

  if (!programmingPlan) {
    return <></>;
  }

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
            disabled={readonly}
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
                required={isOnline}
                min={-90}
                max={90}
                disabled={readonly}
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
                required={isOnline}
                min={-180}
                max={180}
                disabled={readonly}
              />
            </div>
            {programmingPlanKind === 'PPV' && (
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
                  disabled={readonly}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {programmingPlanKindOptions.length > 2 && (
        <AppSelect<FormShape>
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
      {contextOptions.length > 1 && (
        <AppRadioButtons
          legend="Contexte du prélèvement"
          options={
            contextOptions?.map(({ label, value }) => ({
              key: `context-option-${value}`,
              label,
              nativeInputProps: {
                checked: context === value,
                onChange: () => setContext(value as Context)
              },
              illustration: (
                <img
                  src={value === 'Control' ? check : leaf}
                  alt=""
                  aria-hidden
                />
              )
            })) ?? []
          }
          colSm={6}
          inputForm={form}
          inputKey="context"
          whenValid="Contexte du prélèvement correctement renseigné."
          required
          disabled={readonly}
          data-testid="context-radio"
        />
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
            <AppTextInput<FormShape>
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
          <AppTextInput<FormShape>
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
          <AppTextAreaInput<FormShape>
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
                    nativeButtonProps: {
                      'data-testid': 'submit-button'
                    }
                  }
                ]}
              />
              {hasError && (
                <Alert severity="error" small={true} description={'BOOM'} />
              )}
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
