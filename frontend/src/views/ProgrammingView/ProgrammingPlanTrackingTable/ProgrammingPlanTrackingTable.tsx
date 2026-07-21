import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ProgrammingPlanDisplayStatusBadge from '../../../components/ProgrammingPlanDisplayStatusBadge/ProgrammingPlanDisplayStatusBadge';
import { ApiClientContext } from '../../../services/apiClient';
import {
  type AggregateDisplayStatus,
  buildAggregateDisplayStatus,
  buildEchelonDisplayStatus
} from './ProgrammingPlanTrackingTable.utils';
import './ProgrammingPlanTrackingTable.scss';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
}

const Colgroup = () => (
  <colgroup>
    <col className="col-checkbox" />
    <col className="col-name" />
    <col className="col-status" />
    <col className="col-status" />
    <col className="col-status" />
  </colgroup>
);

const ExpandButton = ({
  isExpanded,
  onClick
}: {
  isExpanded: boolean;
  onClick: () => void;
}) => (
  <Button
    iconId={
      isExpanded ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'
    }
    priority="tertiary no outline"
    size="small"
    title={isExpanded ? 'Réduire' : 'Voir le détail'}
    onClick={onClick}
  />
);

const DisabledCheckbox = () => (
  <div className="checkbox-cell">
    <input type="checkbox" disabled />
  </div>
);

const MiniTable = ({ children }: { children: React.ReactNode }) => (
  <div
    className={clsx(
      'fr-table',
      'fr-table--bordered',
      'fr-table--no-caption',
      'fr-table--no-scroll'
    )}
  >
    <table>
      <Colgroup />
      {children}
    </table>
  </div>
);

const ProgrammingPlanTrackingTable = ({ programmingPlans }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(
    new Set()
  );
  const [expandedRegionKeys, setExpandedRegionKeys] = useState<Set<string>>(
    new Set()
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerWrapperRef.current;
    if (!header) {
      return;
    }
    const updateHeight = () => setHeaderHeight(header.offsetHeight);
    const ro = new ResizeObserver(updateHeight);
    ro.observe(header);
    updateHeight();
    return () => ro.disconnect();
  }, []);

  const planIds = useMemo(
    () => programmingPlans.map((plan) => plan.id),
    [programmingPlans]
  );

  const { data: prescriptions } = apiClient.useFindPrescriptionsQuery(
    { programmingPlanIds: planIds },
    { skip: planIds.length === 0 }
  );
  const { data: localPrescriptions } = apiClient.useFindLocalPrescriptionsQuery(
    { programmingPlanIds: planIds },
    { skip: planIds.length === 0 }
  );

  const prescriptionsByPlan = useMemo(
    () => groupBy(prescriptions ?? [], 'programmingPlanId'),
    [prescriptions]
  );
  const localPrescriptionsByPrescription = useMemo(
    () => groupBy(localPrescriptions ?? [], 'prescriptionId'),
    [localPrescriptions]
  );

  const togglePlan = (planId: string) =>
    setExpandedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
      }
      return next;
    });

  const toggleRegion = (planId: string, region: string) =>
    setExpandedRegionKeys((prev) => {
      const key = `${planId}:${region}`;
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  const domainGroups = useMemo(
    () => groupBy(programmingPlans, 'domain'),
    [programmingPlans]
  );

  if (!prescriptions || !localPrescriptions) {
    return null;
  }

  return (
    <div className="programming-plan-tracking-table">
      <div className="header-wrapper" ref={headerWrapperRef}>
        <MiniTable>
          <thead>
            <tr>
              <th scope="col">
                <DisabledCheckbox />
              </th>
              <th scope="col">Nom du plan</th>
              <th scope="col">Statut BGIR</th>
              <th scope="col">Statut région</th>
              <th scope="col">Statut département</th>
            </tr>
          </thead>
        </MiniTable>
      </div>

      {Object.entries(domainGroups).map(([domain, plansInDomain]) => (
        <Fragment key={`domain-${domain}`}>
          <div
            className="plan-group-sticky-container"
            style={{ top: headerHeight }}
          >
            <MiniTable>
              <tbody>
                <tr className="plan-group-header-row">
                  <td>
                    <DisabledCheckbox />
                  </td>
                  <td colSpan={4}>
                    <div className="plan-group-title">
                      {ProgrammingPlanDomainLabels[
                        domain as keyof typeof ProgrammingPlanDomainLabels
                      ] ?? domain}
                    </div>
                  </td>
                </tr>
              </tbody>
            </MiniTable>
          </div>

          <MiniTable>
            <tbody>
              {plansInDomain.map((plan) => {
                const planPrescriptions = prescriptionsByPlan[plan.id] ?? [];
                const planLocalPrescriptions = planPrescriptions.flatMap(
                  (_) => localPrescriptionsByPrescription[_.id] ?? []
                );

                const nationalDisplayStatus = buildEchelonDisplayStatus(
                  plan,
                  planPrescriptions,
                  planLocalPrescriptions,
                  'National'
                );

                const regionalAggregate = buildAggregateDisplayStatus(
                  RegionList.map((region) =>
                    buildEchelonDisplayStatus(
                      plan,
                      planPrescriptions,
                      planLocalPrescriptions,
                      'Regional',
                      region
                    )
                  )
                );

                const departmentalAggregate =
                  plan.distributionKind === 'SLAUGHTERHOUSE'
                    ? buildAggregateDisplayStatus(
                        RegionList.flatMap((region) =>
                          Regions[region].departments.map((department) =>
                            buildEchelonDisplayStatus(
                              plan,
                              planPrescriptions,
                              planLocalPrescriptions,
                              'Departmental',
                              region,
                              department
                            )
                          )
                        )
                      )
                    : undefined;

                const isPlanExpanded = expandedPlanIds.has(plan.id);
                const canExpandDepartments =
                  plan.distributionKind === 'SLAUGHTERHOUSE';

                return (
                  <Fragment key={plan.id}>
                    <tr>
                      <td>
                        <DisabledCheckbox />
                      </td>
                      <td>
                        <div className="row-reference">
                          <ExpandButton
                            isExpanded={isPlanExpanded}
                            onClick={() => togglePlan(plan.id)}
                          />
                          {plan.title}
                        </div>
                      </td>
                      <td>
                        <ProgrammingPlanDisplayStatusBadge
                          result={nationalDisplayStatus}
                          showDates
                          small
                        />
                      </td>
                      <td>
                        <AggregateBadge aggregate={regionalAggregate} />
                      </td>
                      <td>
                        {departmentalAggregate ? (
                          <AggregateBadge aggregate={departmentalAggregate} />
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>

                    {isPlanExpanded &&
                      RegionList.map((region) => {
                        const regionResult = buildEchelonDisplayStatus(
                          plan,
                          planPrescriptions,
                          planLocalPrescriptions,
                          'Regional',
                          region
                        );
                        const regionKey = `${plan.id}:${region}`;
                        const isRegionExpanded =
                          expandedRegionKeys.has(regionKey);

                        return (
                          <Fragment key={regionKey}>
                            <tr className="region-sub-row">
                              <td />
                              <td className="indent-1">
                                <div className="row-reference">
                                  {canExpandDepartments && (
                                    <ExpandButton
                                      isExpanded={isRegionExpanded}
                                      onClick={() =>
                                        toggleRegion(plan.id, region)
                                      }
                                    />
                                  )}
                                  {Regions[region].name}
                                </div>
                              </td>
                              <td />
                              <td>
                                <ProgrammingPlanDisplayStatusBadge
                                  result={regionResult}
                                  showDates
                                  small
                                />
                              </td>
                              <td>
                                {canExpandDepartments ? (
                                  <AggregateBadge
                                    aggregate={buildAggregateDisplayStatus(
                                      Regions[region].departments.map(
                                        (department) =>
                                          buildEchelonDisplayStatus(
                                            plan,
                                            planPrescriptions,
                                            planLocalPrescriptions,
                                            'Departmental',
                                            region,
                                            department
                                          )
                                      )
                                    )}
                                  />
                                ) : (
                                  '—'
                                )}
                              </td>
                            </tr>

                            {isRegionExpanded &&
                              canExpandDepartments &&
                              Regions[region].departments.map((department) => {
                                const departmentResult =
                                  buildEchelonDisplayStatus(
                                    plan,
                                    planPrescriptions,
                                    planLocalPrescriptions,
                                    'Departmental',
                                    region,
                                    department
                                  );
                                return (
                                  <tr
                                    key={`${regionKey}:${department}`}
                                    className="department-sub-row"
                                  >
                                    <td />
                                    <td className="indent-2">
                                      {DepartmentLabels[department]}
                                    </td>
                                    <td />
                                    <td />
                                    <td>
                                      <ProgrammingPlanDisplayStatusBadge
                                        result={departmentResult}
                                        showDates
                                        small
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                          </Fragment>
                        );
                      })}
                  </Fragment>
                );
              })}
            </tbody>
          </MiniTable>
        </Fragment>
      ))}
    </div>
  );
};

const AggregateBadge = ({
  aggregate
}: {
  aggregate: AggregateDisplayStatus;
}) => {
  if (aggregate.value === 'NotApplicable') {
    return <span className="fr-text--sm fr-text-mention--grey">N/A</span>;
  }
  const severity =
    aggregate.value === 'Submitted'
      ? 'success'
      : aggregate.value === 'InProgress'
        ? 'new'
        : 'warning';
  return (
    <span className={cx('fr-badge', `fr-badge--${severity}`)}>
      {aggregate.ratio
        ? `${aggregate.label} (${aggregate.ratio.sent}/${aggregate.ratio.total})`
        : aggregate.label}
    </span>
  );
};

export default ProgrammingPlanTrackingTable;
