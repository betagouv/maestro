//FIXME DOMAIN interface temporaire de rattachement, à supprimer avec le passage de programming_plans.domain_id en notNullable
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import {
  type ProgrammingPlanDomain,
  ProgrammingPlanDomainId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import {
  type ProgrammingPlanChecked,
  ProgrammingPlanSort
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';

type Props = {
  programmingPlans: ProgrammingPlanChecked[];
  domains: ProgrammingPlanDomain[];
};

export const ProgrammingPlanDomainAssignment = ({
  programmingPlans,
  domains,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateProgrammingPlanDomain, updateProgrammingPlanDomainResult] =
    apiClient.useUpdateProgrammingPlanDomainMutation();

  const sortedProgrammingPlans = [...programmingPlans].sort(
    (a, b) =>
      Number(!isNil(a.domainId)) - Number(!isNil(b.domainId)) ||
      ProgrammingPlanSort(a, b)
  );

  return (
    <>
      <Table
        headers={['Plan', 'Année', 'Domaine']}
        data={sortedProgrammingPlans.map((programmingPlan) => {
          const yearDomains = domains.filter(
            (domain) => domain.year === programmingPlan.year
          );

          return [
            <div
              key={`title-${programmingPlan.id}`}
              className={clsx('d-flex-align-center', cx('fr-mb-0'))}
              style={
                isNil(programmingPlan.domainId)
                  ? { color: 'var(--text-default-error)' }
                  : undefined
              }
            >
              {programmingPlan.title}
            </div>,
            String(programmingPlan.year),
            yearDomains.length === 0 ? (
              `Aucun domaine pour ${programmingPlan.year}`
            ) : (
              <Select
                key={`domain-${programmingPlan.id}`}
                label={null}
                disabled={updateProgrammingPlanDomainResult.isLoading}
                nativeSelectProps={{
                  value: programmingPlan.domainId ?? '',
                  'aria-label': `Domaine du plan ${programmingPlan.title}`,
                  onChange: (event) =>
                    updateProgrammingPlanDomain({
                      programmingPlanId: programmingPlan.id,
                      domainId: ProgrammingPlanDomainId.parse(
                        event.target.value
                      )
                    })
                }}
              >
                {isNil(programmingPlan.domainId) && (
                  <option value="" disabled>
                    Sélectionner un domaine
                  </option>
                )}
                {yearDomains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.label}
                  </option>
                ))}
              </Select>
            )
          ];
        })}
      />
      <AppServiceErrorAlert call={updateProgrammingPlanDomainResult} />
    </>
  );
};
