import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Company } from 'maestro-shared/schema/Company/Company';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useContext, useEffect, useMemo } from 'react';
import CompanySearch from 'src/components/CompanySearch/CompanySearch';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { UseForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';

type Props = {
  programmingPlan: ProgrammingPlan;
  partialSample?: PartialSample | PartialSampleToCreate;
  programmingPlanKind: string;
  company: Company | undefined;
  companyOffline: string | undefined;
  isOnline: boolean;
  readonly: boolean;
  form: UseForm<any>;
  onCompanyChange: (company: Company | undefined) => void;
  onCompanyOfflineChange: (companyOffline: string) => void;
  onGeolocationChange?: (x: number | undefined, y: number | undefined) => void;
};

const SampleCompany = ({
  programmingPlan,
  partialSample,
  programmingPlanKind,
  company,
  companyOffline,
  isOnline,
  readonly,
  form,
  onCompanyChange,
  onCompanyOfflineChange,
  onGeolocationChange
}: Props) => {
  const { user } = useAuthentication();
  const apiClient = useContext(ApiClientContext);

  const {
    data: programmingKindLocalPrescriptions,
    isLoading: isLocalPrescriptionLoading
  } = apiClient.useFindLocalPrescriptionsQuery(
    {
      programmingPlanId: programmingPlan.id,
      contexts: programmingPlan.contexts,
      region: isCreatedPartialSample(partialSample)
        ? partialSample.region
        : user?.region,
      department: isCreatedPartialSample(partialSample)
        ? partialSample.department
        : user?.department,
      programmingPlanKinds: [programmingPlanKind as ProgrammingPlanKind]
    },
    {
      skip:
        programmingPlan.distributionKind !== 'SLAUGHTERHOUSE' ||
        !programmingPlanKind
    }
  );

  const filteredCompanies = useMemo(() => {
    if (
      programmingPlan.distributionKind !== 'SLAUGHTERHOUSE' ||
      isLocalPrescriptionLoading
    ) {
      return undefined;
    }
    return user?.companies.filter(({ siret }) =>
      programmingPlanKind
        ? programmingKindLocalPrescriptions?.some(
            (_) => _.companySiret === siret
          )
        : true
    );
  }, [
    programmingPlan.distributionKind,
    user?.companies,
    programmingKindLocalPrescriptions,
    programmingPlanKind,
    isLocalPrescriptionLoading
  ]);

  useEffect(
    () => {
      if (
        programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
        !isLocalPrescriptionLoading &&
        filteredCompanies
      ) {
        if (
          company &&
          !filteredCompanies.some((c) => c.siret === company.siret)
        ) {
          onCompanyChange(undefined);
        } else if (filteredCompanies.length === 1 && !company) {
          onCompanyChange(filteredCompanies[0]);
          if (onGeolocationChange) {
            onGeolocationChange(
              filteredCompanies[0].geolocation?.x,
              filteredCompanies[0].geolocation?.y
            );
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filteredCompanies,
      company,
      programmingPlan.distributionKind,
      isLocalPrescriptionLoading
    ]
  );

  return (
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
            Entité saisie hors ligne à compléter :{' '}
          </span>
          {companyOffline}
        </div>
      )}
      <div className={cx('fr-col-12')}>
        {isOnline && !readonly ? (
          <CompanySearch
            initialCompany={company ?? undefined}
            onSelectCompany={(result) => {
              onCompanyChange(result);
              if (
                programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
                onGeolocationChange
              ) {
                onGeolocationChange(
                  result?.geolocation?.x,
                  result?.geolocation?.y
                );
              }
            }}
            state={form.messageType('company')}
            stateRelatedMessage={
              form.message('company') ?? 'Entité correctement renseignée'
            }
            companies={filteredCompanies}
          />
        ) : (
          <AppTextInput
            type="text"
            defaultValue={companyOffline ?? ''}
            onChange={(e) => onCompanyOfflineChange(e.target.value)}
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
    </div>
  );
};

export default SampleCompany;
