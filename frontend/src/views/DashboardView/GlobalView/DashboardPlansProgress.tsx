import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  filteredLocalPrescriptions,
  type LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  getPrescriptionTitle,
  sortPrescriptions
} from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  findPrescriptionSubPlan,
  isPPVSubPlan,
  stagesFromSubPlans
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { getSubPlanMatrixKinds } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import { type FunctionComponent, useContext, useMemo } from 'react';
import { AuthenticatedAppRoutes } from 'src/AppRoutes';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { ApiClientContext } from 'src/services/apiClient';
import { pluralize } from 'src/utils/stringUtils';
import type { DashboardFilters } from './DashboardGlobalFilters';
import { ProgressCard } from './ProgressCard';

type Props = {
  year: number;
  programmingPlans: ProgrammingPlanChecked[];
  filters: DashboardFilters;
};

type ProgressEntry = {
  key: string;
  title: string;
  linkTo: string;
  localPrescriptions: LocalPrescription[];
  plan: ProgrammingPlanChecked;
  subPlanCount?: number;
};

const DashboardPlansProgress: FunctionComponent<Props> = ({
  year,
  programmingPlans,
  filters
}) => {
  const apiClient = useContext(ApiClientContext);
  const { user } = useAuthentication();
  const matrixReferential = useMatrixReferential();

  const programmingPlanIds = useMemo(
    () => programmingPlans.map((plan) => plan.id),
    [programmingPlans]
  );

  const { data: prescriptions } = apiClient.useFindPrescriptionsQuery(
    { programmingPlanIds },
    { skip: programmingPlanIds.length === 0 }
  );

  const { data: localPrescriptionsData } =
    apiClient.useFindLocalPrescriptionsQuery(
      { programmingPlanIds, includes: ['sampleCounts'] },
      { skip: programmingPlanIds.length === 0 }
    );

  const localPrescriptions = useMemo(
    () =>
      filteredLocalPrescriptions(localPrescriptionsData ?? [], {
        region: user?.region ?? undefined,
        department: filters.departments[0] ?? user?.department ?? undefined,
        companies:
          filters.companySirets.length > 0
            ? (user?.companies ?? []).filter((company) =>
                filters.companySirets.includes(company.siret)
              )
            : user?.companies
      }),
    [localPrescriptionsData, user, filters.departments, filters.companySirets]
  );

  const entries = useMemo<ProgressEntry[]>(() => {
    const sorted = sortPrescriptions(prescriptions ?? [], programmingPlans);

    return programmingPlans.flatMap((plan) => {
      const planPrescriptions = sorted.filter((prescription) =>
        plan.subPlans.some(
          (subPlan) =>
            subPlan.id === prescription.programmingSubPlanId &&
            (filters.matrixKinds.length === 0 ||
              getSubPlanMatrixKinds(subPlan.matrices).some((matrixKind) =>
                filters.matrixKinds.includes(matrixKind)
              ))
        )
      );

      const rowsOf = (prescriptionIds: string[]) =>
        localPrescriptions.filter((localPrescription) =>
          prescriptionIds.includes(localPrescription.prescriptionId)
        );

      const isPPV = plan.subPlans.some(isPPVSubPlan);

      if (isPPV) {
        return planPrescriptions
          .map((prescription) => ({
            key: prescription.id,
            title: getPrescriptionTitle(
              matrixReferential,
              [plan],
              prescription
            ),
            linkTo: AuthenticatedAppRoutes.SamplesByYearRoute.link(year, {
              programmingPlanIds: [plan.id],
              matrixKinds: getSubPlanMatrixKinds(
                findPrescriptionSubPlan([plan], prescription)?.matrices ?? null
              )
            }),
            localPrescriptions: rowsOf([prescription.id]),
            plan
          }))
          .filter((entry) => entry.localPrescriptions.length > 0);
      }

      const planRows = rowsOf(
        planPrescriptions.map((prescription) => prescription.id)
      );

      return planRows.length === 0
        ? []
        : [
            {
              key: plan.id,
              title: plan.title,
              linkTo: AuthenticatedAppRoutes.SamplesByYearRoute.link(year, {
                programmingPlanIds: [plan.id]
              }),
              localPrescriptions: planRows,
              plan,
              subPlanCount: plan.subPlans.length
            }
          ];
    });
  }, [
    prescriptions,
    localPrescriptions,
    programmingPlans,
    year,
    filters.matrixKinds,
    matrixReferential
  ]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={clsx('white-container', cx('fr-px-3w', 'fr-py-2w'))}>
      <h5 className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-3w')}>
        Avancement par plans ({entries.length})
      </h5>
      <div className={cx('fr-grid-row')}>
        {entries.map((entry) => (
          <ProgressCard
            key={entry.key}
            title={entry.title}
            linkTo={entry.linkTo}
            localPrescriptions={entry.localPrescriptions}
            header={
              entry.subPlanCount === undefined ? undefined : (
                <div className={cx('fr-mb-1w')}>
                  <div>
                    {stagesFromSubPlans(entry.plan.subPlans).map((stage) => (
                      <Tag key={`${entry.key}-${stage}`} small>
                        {StageLabels[stage]}
                      </Tag>
                    ))}
                  </div>
                  <span className={cx('fr-hint-text', 'fr-text--sm')}>
                    {entry.subPlanCount}{' '}
                    {pluralize(entry.subPlanCount)('sous-plan')}
                  </span>
                </div>
              )
            }
          />
        ))}
      </div>
      <p className={cx('fr-hint-text', 'fr-text--xs', 'fr-mt-2w', 'fr-mb-0')}>
        {sumBy(entries, (entry) =>
          sumBy(entry.localPrescriptions, 'sampleCount')
        )}{' '}
        prélèvements programmés sur les plans affichés
      </p>
    </div>
  );
};

export default DashboardPlansProgress;
