import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Company } from 'maestro-shared/schema/Company/Company';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useEffect, useMemo } from 'react';
import CompanySearch from 'src/components/CompanySearch/CompanySearch';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { UseForm } from 'src/hooks/useForm';
import { usePartialSample } from '../../../../hooks/usePartialSample';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
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
  const { programmingPlanPrescriptions, programmingPlanLocalPrescriptions } =
    usePartialSample(partialSample);

  const programmingKindLocalPrescriptions = useMemo(
    () =>
      programmingPlanLocalPrescriptions?.filter((localPrescription) =>
        programmingPlanPrescriptions?.some(
          (prescription) =>
            prescription.id === localPrescription.prescriptionId &&
            prescription.programmingPlanKind === programmingPlanKind
        )
      ),
    [
      programmingPlanLocalPrescriptions,
      programmingPlanPrescriptions,
      programmingPlanKind
    ]
  );

  const filteredCompanies = useMemo(() => {
    if (programmingPlan.distributionKind !== 'SLAUGHTERHOUSE') {
      return undefined;
    }
    return user?.companies?.filter(({ siret }) =>
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
    programmingPlanKind
  ]);

  useEffect(
    () => {
      if (
        programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
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
    [filteredCompanies, company, programmingPlan.distributionKind] // eslint-disable-line react-hooks/exhaustive-deps
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
            initialValue={company ?? undefined}
            onSelect={(result) => {
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
