import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { Company } from 'maestro-shared/schema/Company/Company';
import {
  type CompanyWorkshop,
  companyWorkshopLabel
} from 'maestro-shared/schema/Company/CompanyWorkshop';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useEffect, useMemo } from 'react';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import CompanySearch from 'src/components/CompanySearch/CompanySearch';
import { useAuthentication } from 'src/hooks/useAuthentication';
import type { UseForm } from 'src/hooks/useForm';
import { usePartialSample } from '../../../../hooks/usePartialSample';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
  partialSample?: PartialSample | PartialSampleToCreate;
  programmingSubPlanId: string;
  company: Company | undefined;
  companyOffline: string | undefined;
  companyWorkshop: CompanyWorkshop | undefined;
  companyWorkshops: CompanyWorkshop[];
  readonly: boolean;
  form: UseForm<any>;
  onCompanyChange: (company: Company | undefined) => void;
  onCompanyWorkshopChange: (workshop: CompanyWorkshop | undefined) => void;
  onGeolocationChange?: (x: number | undefined, y: number | undefined) => void;
};

const SampleCompany = ({
  programmingPlan,
  partialSample,
  programmingSubPlanId,
  company,
  companyOffline,
  companyWorkshop,
  companyWorkshops,
  readonly,
  form,
  onCompanyChange,
  onCompanyWorkshopChange,
  onGeolocationChange
}: Props) => {
  const { user } = useAuthentication();
  const { programmingPlanPrescriptions, programmingPlanLocalPrescriptions } =
    usePartialSample(partialSample);

  const programmingSubPlanLocalPrescriptions = useMemo(
    () =>
      programmingPlanLocalPrescriptions?.filter((localPrescription) =>
        programmingPlanPrescriptions?.some(
          (prescription) =>
            prescription.id === localPrescription.prescriptionId &&
            prescription.programmingSubPlanId === programmingSubPlanId
        )
      ),
    [
      programmingPlanLocalPrescriptions,
      programmingPlanPrescriptions,
      programmingSubPlanId
    ]
  );

  const filteredCompanies = useMemo(() => {
    if (programmingPlan.distributionKind !== 'SLAUGHTERHOUSE') {
      return undefined;
    }

    if (
      programmingSubPlanId &&
      programmingSubPlanLocalPrescriptions === undefined
    ) {
      return undefined;
    }
    return user?.companies?.filter(({ siret }) =>
      programmingSubPlanId
        ? programmingSubPlanLocalPrescriptions?.some(
            (_) => _.companySiret === siret
          )
        : true
    );
  }, [
    programmingPlan.distributionKind,
    user?.companies,
    programmingSubPlanLocalPrescriptions,
    programmingSubPlanId
  ]);

  useEffect(() => {
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
  }, [filteredCompanies, company, programmingPlan.distributionKind]);

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {companyOffline && !company && (
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
        {!readonly ? (
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
            inputForm={form}
            inputKey="companyOffline"
            whenValid="Entité correctement renseignée."
            label="Entité contrôlée"
            required
            disabled={readonly}
          />
        )}
      </div>
      {companyWorkshops.length > 0 && (
        <div className={cx('fr-col-12')}>
          <AppSelect
            value={companyWorkshop?.id ?? ''}
            options={selectOptionsFromList(
              companyWorkshops.map((workshop) => workshop.id),
              {
                labels: Object.fromEntries(
                  companyWorkshops.map((workshop) => [
                    workshop.id,
                    companyWorkshopLabel(workshop)
                  ])
                )
              }
            )}
            onChange={(e) =>
              onCompanyWorkshopChange(
                companyWorkshops.find(
                  (workshop) => workshop.id === e.target.value
                )
              )
            }
            inputForm={form}
            inputKey="companyWorkshop"
            whenValid="Atelier correctement renseigné."
            data-testid="companyWorkshop-select"
            label="Atelier"
            required
            disabled={readonly}
          />
        </div>
      )}
    </div>
  );
};

export default SampleCompany;
