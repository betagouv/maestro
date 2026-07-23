import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import type { DisplayStatusResult } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
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
import AppToast from '../../../components/_app/AppToast/AppToast';
import ProgrammingPlanDisplayStatusBadge from '../../../components/ProgrammingPlanDisplayStatusBadge/ProgrammingPlanDisplayStatusBadge';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import ProgrammingPlanBulkSendAdminModal, {
  bulkSendAdminModal
} from './ProgrammingPlanTrackingActionBar/ProgrammingPlanBulkSendAdminModal';
import ProgrammingPlanBulkSendNationalModal, {
  bulkSendNationalModal
} from './ProgrammingPlanTrackingActionBar/ProgrammingPlanBulkSendNationalModal';
import ProgrammingPlanBulkSendRegionalModal, {
  bulkSendRegionalModal
} from './ProgrammingPlanTrackingActionBar/ProgrammingPlanBulkSendRegionalModal';
import ProgrammingPlanTrackingActionBar from './ProgrammingPlanTrackingActionBar/ProgrammingPlanTrackingActionBar';
import ProgrammingPlanTrackingFilters from './ProgrammingPlanTrackingFilters';
import ProgrammingPlanTrackingHeader from './ProgrammingPlanTrackingHeader';
import {
  type AggregateDisplayStatus,
  buildAggregateDisplayStatus,
  buildEchelonDisplayStatus
} from './ProgrammingPlanTrackingTable.utils';
import './ProgrammingPlanTrackingTable.scss';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
  // Presence switches the table to regional mode: scoped to this single
  // region, eligibility/actions governed by the Regional echelon instead of
  // National, expansion goes straight to department rows (no region level).
  region?: Region;
}

const Colgroup = ({ statusColumnCount }: { statusColumnCount: number }) => (
  <colgroup>
    <col className="col-checkbox" />
    <col className="col-name" />
    {Array.from({ length: statusColumnCount }, (_, i) => (
      <col key={`col-status-${i}`} className="col-status" />
    ))}
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

const SelectionCheckbox = ({
  checked,
  indeterminate,
  disabled,
  onChange,
  variant = 'row'
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: () => void;
  variant?: 'header' | 'row';
}) => {
  const checkbox = (
    <Checkbox
      options={[
        {
          label: '',
          nativeInputProps: {
            checked,
            disabled,
            onChange,
            ref: (el: HTMLInputElement | null) => {
              if (el) {
                el.indeterminate = indeterminate ?? false;
              }
            }
          }
        }
      ]}
      small
      className={cx('fr-pb-3w')}
    />
  );
  return variant === 'header' ? (
    <div className={clsx(cx('fr-checkbox-group'), 'selectable-cell')}>
      {checkbox}
    </div>
  ) : (
    <div className="selectable-cell">{checkbox}</div>
  );
};

const MiniTable = ({
  statusColumnCount,
  children
}: {
  statusColumnCount: number;
  children: React.ReactNode;
}) => (
  <div
    className={clsx(
      'fr-table',
      'fr-table--bordered',
      'fr-table--no-caption',
      'fr-table--no-scroll'
    )}
  >
    <table>
      <Colgroup statusColumnCount={statusColumnCount} />
      {children}
    </table>
  </div>
);

const ProgrammingPlanTrackingTable = ({ programmingPlans, region }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasRole } = useAuthentication();
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(
    new Set()
  );
  const [expandedRegionKeys, setExpandedRegionKeys] = useState<Set<string>>(
    new Set()
  );
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(
    new Set()
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(false);
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
    { programmingPlanIds: planIds, allLevels: true },
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

  const planStatusInfo = useMemo(() => {
    const map = new Map<
      string,
      {
        nationalDisplayStatus: DisplayStatusResult;
        regionalDisplayStatus: DisplayStatusResult | undefined;
        isEligible: boolean;
        regionalAggregate: AggregateDisplayStatus;
        departmentalAggregate: AggregateDisplayStatus | undefined;
        isFinalized: boolean;
      }
    >();
    for (const plan of programmingPlans) {
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

      const regionalDisplayStatus = region
        ? buildEchelonDisplayStatus(
            plan,
            planPrescriptions,
            planLocalPrescriptions,
            'Regional',
            region
          )
        : undefined;

      const regionalAggregate = buildAggregateDisplayStatus(
        RegionList.map((regionColumn) =>
          buildEchelonDisplayStatus(
            plan,
            planPrescriptions,
            planLocalPrescriptions,
            'Regional',
            regionColumn
          )
        )
      );

      const departmentalAggregate =
        plan.distributionKind === 'SLAUGHTERHOUSE'
          ? buildAggregateDisplayStatus(
              (region ? [region] : RegionList).flatMap((regionColumn) =>
                Regions[regionColumn].departments.map((department) =>
                  buildEchelonDisplayStatus(
                    plan,
                    planPrescriptions,
                    planLocalPrescriptions,
                    'Departmental',
                    regionColumn,
                    department
                  )
                )
              )
            )
          : undefined;

      const deepestAggregate = departmentalAggregate ?? regionalAggregate;

      // A resend after modification is National-only: the admin's role stops
      // at the first send, so an already-sent-then-modified plan is not
      // selectable for bulk-send when logged in as Administrator. In regional
      // mode, eligibility is governed by that region's own Regional echelon
      // status instead, and only SLAUGHTERHOUSE plans cascade to departments
      // (REGIONAL plans follow a separate approval workflow).
      const isSubmittedToAdmin =
        plan.nationalStatus.status === 'SubmittedToAdmin';
      const isEligible = region
        ? plan.distributionKind === 'SLAUGHTERHOUSE' &&
          regionalDisplayStatus?.value === 'ReadyToSend'
        : hasRole('Administrator')
          ? (nationalDisplayStatus.value === 'ReadyToSend' &&
              !nationalDisplayStatus.modified) ||
            isSubmittedToAdmin
          : nationalDisplayStatus.value === 'ReadyToSend';

      map.set(plan.id, {
        nationalDisplayStatus,
        regionalDisplayStatus,
        isEligible,
        regionalAggregate,
        departmentalAggregate,
        isFinalized: deepestAggregate.value === 'Submitted'
      });
    }
    return map;
  }, [
    programmingPlans,
    prescriptionsByPlan,
    localPrescriptionsByPrescription,
    hasRole,
    region
  ]);

  const indicators = useMemo(
    () => ({
      totalCount: programmingPlans.length,
      finalizedCount: programmingPlans.filter(
        (plan) => planStatusInfo.get(plan.id)?.isFinalized
      ).length,
      submittedCount: programmingPlans.filter(
        (plan) =>
          planStatusInfo.get(plan.id)?.nationalDisplayStatus.value ===
          'Submitted'
      ).length,
      readyToSendCount: programmingPlans.filter(
        (plan) => planStatusInfo.get(plan.id)?.isEligible
      ).length
    }),
    [programmingPlans, planStatusInfo]
  );

  const [planFilterIds, setPlanFilterIds] = useState<string[]>([]);

  const displayedPlans = useMemo(
    () =>
      planFilterIds.length
        ? programmingPlans.filter((plan) => planFilterIds.includes(plan.id))
        : programmingPlans,
    [programmingPlans, planFilterIds]
  );

  const displayedPlanIds = useMemo(
    () => displayedPlans.map((plan) => plan.id),
    [displayedPlans]
  );

  const selectedPlans = useMemo(
    () => programmingPlans.filter((plan) => selectedPlanIds.has(plan.id)),
    [programmingPlans, selectedPlanIds]
  );

  const plansToAdmin = useMemo(
    () =>
      selectedPlans.filter(
        (plan) => !planStatusInfo.get(plan.id)?.nationalDisplayStatus.modified
      ),
    [selectedPlans, planStatusInfo]
  );

  const plansToRegions = useMemo(
    () =>
      selectedPlans.filter(
        (plan) => planStatusInfo.get(plan.id)?.nationalDisplayStatus.modified
      ),
    [selectedPlans, planStatusInfo]
  );

  const handleSendSuccess = () => {
    setSelectedPlanIds(new Set());
    setSendSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelectionForScope = (scopePlanIds: string[]) => {
    const eligibleInScope = scopePlanIds.filter(
      (id) => planStatusInfo.get(id)?.isEligible
    );
    setSelectedPlanIds((prev) => {
      const allSelected =
        eligibleInScope.length > 0 &&
        eligibleInScope.every((id) => prev.has(id));
      const next = new Set(prev);
      for (const id of eligibleInScope) {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
  };

  const togglePlanSelection = (planId: string) =>
    setSelectedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
      }
      return next;
    });

  const getScopeSelectionState = (scopePlanIds: string[]) => {
    const eligibleInScope = scopePlanIds.filter(
      (id) => planStatusInfo.get(id)?.isEligible
    );
    const selectedCount = eligibleInScope.filter((id) =>
      selectedPlanIds.has(id)
    ).length;
    return {
      checked:
        eligibleInScope.length > 0 && selectedCount === eligibleInScope.length,
      indeterminate:
        selectedCount > 0 && selectedCount < eligibleInScope.length,
      disabled: eligibleInScope.length === 0
    };
  };

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
    () => groupBy(displayedPlans, 'domain'),
    [displayedPlans]
  );

  // Regional mode drops the "Statut BGIR" (national) column — only relevant
  // to national/admin.
  const statusColumnCount = region ? 2 : 3;

  if (!prescriptions || !localPrescriptions) {
    return null;
  }

  return (
    <>
      <AppToast
        open={sendSuccess}
        description="Les plans sélectionnés ont bien été envoyés."
        onClose={() => setSendSuccess(false)}
      />
      <ProgrammingPlanTrackingHeader {...indicators} />
      <ProgrammingPlanTrackingFilters
        plans={programmingPlans}
        selectedPlanIds={planFilterIds}
        onChange={setPlanFilterIds}
      />
      <ProgrammingPlanTrackingActionBar
        selectedCount={selectedPlanIds.size}
        onDeselectAll={() => setSelectedPlanIds(new Set())}
        onOpenAdminModal={() => bulkSendAdminModal.open()}
        onOpenNationalModal={() => bulkSendNationalModal.open()}
        onOpenRegionalModal={() => bulkSendRegionalModal.open()}
        onHeightChange={setBannerHeight}
      />
      <ProgrammingPlanBulkSendAdminModal
        plans={selectedPlans}
        onSuccess={handleSendSuccess}
      />
      <ProgrammingPlanBulkSendNationalModal
        plansToAdmin={plansToAdmin}
        plansToRegions={plansToRegions}
        onSuccess={handleSendSuccess}
      />
      <ProgrammingPlanBulkSendRegionalModal
        plans={selectedPlans}
        onSuccess={handleSendSuccess}
      />
      <div className="programming-plan-tracking-table">
        <div
          className="header-wrapper"
          style={{ top: bannerHeight }}
          ref={headerWrapperRef}
        >
          <MiniTable statusColumnCount={statusColumnCount}>
            <thead>
              <tr>
                <th scope="col">
                  <SelectionCheckbox
                    variant="header"
                    {...getScopeSelectionState(displayedPlanIds)}
                    onChange={() => toggleSelectionForScope(displayedPlanIds)}
                  />
                </th>
                <th scope="col">Nom du plan</th>
                {!region && <th scope="col">Statut BGIR</th>}
                <th scope="col">Statut région</th>
                <th scope="col">Statut département</th>
              </tr>
            </thead>
          </MiniTable>
        </div>

        {Object.entries(domainGroups).map(([domain, plansInDomain]) => {
          const domainPlanIds = plansInDomain.map((plan) => plan.id);

          return (
            <Fragment key={`domain-${domain}`}>
              <div
                className="plan-group-sticky-container"
                style={{ top: bannerHeight + headerHeight }}
              >
                <MiniTable statusColumnCount={statusColumnCount}>
                  <tbody>
                    <tr className="plan-group-header-row">
                      <td>
                        <SelectionCheckbox
                          variant="header"
                          {...getScopeSelectionState(domainPlanIds)}
                          onChange={() =>
                            toggleSelectionForScope(domainPlanIds)
                          }
                        />
                      </td>
                      <td colSpan={statusColumnCount + 1}>
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

              <MiniTable statusColumnCount={statusColumnCount}>
                <tbody>
                  {plansInDomain.map((plan) => {
                    const planPrescriptions =
                      prescriptionsByPlan[plan.id] ?? [];
                    const planLocalPrescriptions = planPrescriptions.flatMap(
                      (_) => localPrescriptionsByPrescription[_.id] ?? []
                    );

                    // Always present: planStatusInfo is built from this same programmingPlans list.
                    const {
                      nationalDisplayStatus,
                      regionalDisplayStatus,
                      isEligible,
                      regionalAggregate,
                      departmentalAggregate
                    } = planStatusInfo.get(plan.id)!;

                    const isPlanExpanded = expandedPlanIds.has(plan.id);
                    const canExpandDepartments =
                      plan.distributionKind === 'SLAUGHTERHOUSE';

                    return (
                      <Fragment key={plan.id}>
                        <tr>
                          <td>
                            <SelectionCheckbox
                              checked={selectedPlanIds.has(plan.id)}
                              disabled={!isEligible}
                              onChange={() => togglePlanSelection(plan.id)}
                            />
                          </td>
                          <td>
                            <div className="row-reference">
                              {plan.title}
                              <ExpandButton
                                isExpanded={isPlanExpanded}
                                onClick={() => togglePlan(plan.id)}
                              />
                            </div>
                          </td>
                          {!region && (
                            <td>
                              <ProgrammingPlanDisplayStatusBadge
                                result={nationalDisplayStatus}
                                showDates
                                small
                              />
                            </td>
                          )}
                          <td>
                            {region ? (
                              regionalDisplayStatus ? (
                                <ProgrammingPlanDisplayStatusBadge
                                  result={regionalDisplayStatus}
                                  showDates
                                  small
                                />
                              ) : (
                                '—'
                              )
                            ) : (
                              <AggregateBadge aggregate={regionalAggregate} />
                            )}
                          </td>
                          <td>
                            {departmentalAggregate ? (
                              <AggregateBadge
                                aggregate={departmentalAggregate}
                              />
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>

                        {isPlanExpanded &&
                          region &&
                          canExpandDepartments &&
                          Regions[region].departments.map((department) => {
                            const departmentResult = buildEchelonDisplayStatus(
                              plan,
                              planPrescriptions,
                              planLocalPrescriptions,
                              'Departmental',
                              region,
                              department
                            );
                            return (
                              <tr
                                key={`${plan.id}:${region}:${department}`}
                                className="department-sub-row"
                              >
                                <td colSpan={statusColumnCount + 2}>
                                  <div className="sub-row-bar">
                                    <span className="department-name">
                                      {DepartmentLabels[department]} (
                                      {department})
                                    </span>
                                    <ProgrammingPlanDisplayStatusBadge
                                      result={departmentResult}
                                      small
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                        {isPlanExpanded &&
                          !region &&
                          RegionList.map((regionColumn) => {
                            const regionResult = buildEchelonDisplayStatus(
                              plan,
                              planPrescriptions,
                              planLocalPrescriptions,
                              'Regional',
                              regionColumn
                            );
                            const regionKey = `${plan.id}:${regionColumn}`;
                            const isRegionExpanded =
                              expandedRegionKeys.has(regionKey);

                            const departmentResultsForRegion =
                              canExpandDepartments
                                ? Regions[regionColumn].departments.map(
                                    (department) =>
                                      buildEchelonDisplayStatus(
                                        plan,
                                        planPrescriptions,
                                        planLocalPrescriptions,
                                        'Departmental',
                                        regionColumn,
                                        department
                                      )
                                  )
                                : [];
                            const submittedDepartmentsCount =
                              departmentResultsForRegion.filter(
                                (_) => _.value === 'Submitted'
                              ).length;

                            return (
                              <Fragment key={regionKey}>
                                <tr
                                  className={clsx(
                                    'region-sub-row',
                                    isRegionExpanded && 'is-expanded'
                                  )}
                                >
                                  <td colSpan={5}>
                                    <div className="sub-row-bar">
                                      <div className="row-reference">
                                        <span className="region-name">
                                          {Regions[regionColumn].name}
                                        </span>
                                        {canExpandDepartments && (
                                          <span className="fr-text--xs sub-count">
                                            {submittedDepartmentsCount}/
                                            {departmentResultsForRegion.length}{' '}
                                            départements
                                          </span>
                                        )}
                                      </div>
                                      <div className="row-reference">
                                        <ProgrammingPlanDisplayStatusBadge
                                          result={regionResult}
                                          small
                                        />
                                        {canExpandDepartments && (
                                          <ExpandButton
                                            isExpanded={isRegionExpanded}
                                            onClick={() =>
                                              toggleRegion(
                                                plan.id,
                                                regionColumn
                                              )
                                            }
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>

                                {isRegionExpanded &&
                                  canExpandDepartments &&
                                  Regions[regionColumn].departments.map(
                                    (department) => {
                                      const departmentResult =
                                        buildEchelonDisplayStatus(
                                          plan,
                                          planPrescriptions,
                                          planLocalPrescriptions,
                                          'Departmental',
                                          regionColumn,
                                          department
                                        );
                                      return (
                                        <tr
                                          key={`${regionKey}:${department}`}
                                          className="department-sub-row"
                                        >
                                          <td colSpan={5}>
                                            <div className="sub-row-bar">
                                              <span className="department-name">
                                                {DepartmentLabels[department]} (
                                                {department})
                                              </span>
                                              <ProgrammingPlanDisplayStatusBadge
                                                result={departmentResult}
                                                small
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                              </Fragment>
                            );
                          })}
                      </Fragment>
                    );
                  })}
                </tbody>
              </MiniTable>
            </Fragment>
          );
        })}
      </div>
    </>
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
