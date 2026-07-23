import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy, isNil, sumBy } from 'lodash-es';
import {
  DepartmentLabels,
  DepartmentSort
} from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import {
  type LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  type LocalPrescriptionKey,
  type LocalPrescriptionKeyString,
  toLocalPrescriptionKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import {
  getPrescriptionTitle,
  hasPrescriptionPermission,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import {
  ContextLabels,
  type ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { Fragment, useEffect, useRef, useState } from 'react';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import LaboratorySelect from 'src/components/LaboratorySelect/LaboratorySelect';
import PrescriptionDistributionBadge from 'src/components/Prescription/PrescriptionDistributionBadge/PrescriptionDistributionBadge';
import SelectionCheckbox from 'src/components/SelectionCheckbox/SelectionCheckbox';
import TableHeaderCell from 'src/components/TableHeaderCell/TableHeaderCell';
import { z } from 'zod';
import { useAuthentication } from '../../../hooks/useAuthentication';
import './ProgrammingPrescriptionTable.scss';
import PrescriptionSubstances from '../../../components/Prescription/PrescriptionSubstances/PrescriptionSubstances';

const PlanHeaderRowKey = z.string().brand('PlanHeaderRowKey');
type PlanHeaderRowKey = z.infer<typeof PlanHeaderRowKey>;

const PrescriptionRowKey = z.string().brand('PrescriptionRowKey');
type PrescriptionRowKey = z.infer<typeof PrescriptionRowKey>;

type RowWrapperKey = PlanHeaderRowKey | PrescriptionRowKey;

const toPlanHeaderRowKey = (
  planId: string,
  context: ProgrammingPlanContext
): PlanHeaderRowKey =>
  PlanHeaderRowKey.parse(`plan-header-${planId}-${context}`);

const toPrescriptionRowKey = (id: string): PrescriptionRowKey =>
  PrescriptionRowKey.parse(id);

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
  prescriptions: Prescription[];
  regionalPrescriptions: LocalPrescription[];
  onChangeLocalPrescriptionCount: (
    key: LocalPrescriptionKey,
    count: number
  ) => void;
  onChangePrescriptionSampleCount?: (
    prescription: Prescription,
    sampleCount: number
  ) => void;
  pendingPrescriptionIds?: Set<string>;
  pendingLocalKeys?: Set<LocalPrescriptionKeyString>;
  onChangeLocalPrescriptionLaboratories?: (
    key: LocalPrescriptionKey,
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => void;
  pendingLaboratoryKeys?: Set<LocalPrescriptionKeyString>;
  // Presence switches the table to regional mode: one column per department
  // of this region instead of one per region, own-total column becomes the
  // region's own sampleCount instead of the national one (editable for
  // REGIONAL-kind plans, which have no department cascade; read-only mirror
  // for SLAUGHTERHOUSE, distributed to departments instead).
  region?: Region;
  subLocalPrescriptions?: LocalPrescription[];
  selectedPrescriptions?: Prescription[];
  onTogglePrescriptionSelection?: (prescription: Prescription) => void;
  // Height of any sticky banner rendered above this table by the parent
  // (e.g. the bulk laboratory assignment bar) — shifts this table's own
  // sticky header/group-title offsets down so they don't sit underneath it.
  topOffset?: number;
}

const Colgroup = ({
  columnCount,
  showLaboratoryColumn,
  showCheckboxColumn
}: {
  columnCount: number;
  showLaboratoryColumn: boolean;
  showCheckboxColumn: boolean;
}) => (
  <colgroup>
    {showCheckboxColumn && <col className="col-checkbox" />}
    <col className="col-n" />
    <col className="col-matrice" />
    <col className="col-analyte" />
    {showLaboratoryColumn && <col className="col-laboratoire" />}
    <col className="col-prelevements" />
    {Array.from({ length: columnCount }, (_, i) => (
      <col key={`col-${i}`} className="col-region" />
    ))}
  </colgroup>
);

const ProgrammingPrescriptionTable = ({
  programmingPlans,
  prescriptions: allPrescriptions,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount,
  onChangePrescriptionSampleCount,
  pendingPrescriptionIds,
  pendingLocalKeys,
  onChangeLocalPrescriptionLaboratories,
  pendingLaboratoryKeys,
  region,
  subLocalPrescriptions = [],
  selectedPrescriptions = [],
  onTogglePrescriptionSelection,
  topOffset = 0
}: Props) => {
  const { hasUserLocalPrescriptionPermission, userRole } = useAuthentication();
  const showCheckboxColumn = !!onTogglePrescriptionSelection;

  const isPrescriptionSelected = (prescription: Prescription) =>
    selectedPrescriptions.some((p) => p.id === prescription.id);

  const getSelectionState = (scope: Prescription[]) => {
    const selectedCount = scope.filter(isPrescriptionSelected).length;
    return {
      checked: scope.length > 0 && selectedCount === scope.length,
      indeterminate: selectedCount > 0 && selectedCount < scope.length
    };
  };

  const toggleGroupSelection = (scope: Prescription[]) => {
    if (!onTogglePrescriptionSelection) {
      return;
    }
    const { checked } = getSelectionState(scope);
    scope.forEach((prescription) => {
      const selected = isPrescriptionSelected(prescription);
      if (checked ? selected : !selected) {
        onTogglePrescriptionSelection(prescription);
      }
    });
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [headerHeight, setHeaderHeight] = useState(0);
  const syncingRef = useRef(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const rowWrapperRefs = useRef<Map<RowWrapperKey, HTMLDivElement>>(new Map());
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);

  const sync = (source: HTMLDivElement) => {
    if (syncingRef.current) {
      return;
    }
    syncingRef.current = true;
    [
      headerWrapperRef.current,
      ...Array.from(rowWrapperRefs.current.values()),
      stickyScrollRef.current
    ]
      .filter((el): el is HTMLDivElement => !!el && el !== source)
      .forEach((el) => {
        el.scrollLeft = source.scrollLeft;
      });
    syncingRef.current = false;
  };

  useEffect(() => {
    if (headerWrapperRef.current) {
      headerWrapperRef.current.scrollLeft = 0;
    }
    if (stickyScrollRef.current) {
      stickyScrollRef.current.scrollLeft = 0;
    }
    rowWrapperRefs.current.forEach((el) => {
      el.scrollLeft = 0;
    });
  }, [allPrescriptions]);

  useEffect(() => {
    const header = headerWrapperRef.current;
    const sticky = stickyScrollRef.current;
    const inner = stickyInnerRef.current;
    if (!header || !sticky || !inner) {
      return;
    }

    const updateWidth = () => {
      inner.style.width = `${header.scrollWidth}px`;
      setHeaderHeight(header.offsetHeight);
    };
    const ro = new ResizeObserver(updateWidth);
    ro.observe(header);
    const tableEl = header.querySelector('table');
    if (tableEl) {
      ro.observe(tableEl);
    }
    updateWidth();

    const onHeaderScroll = () => sync(header);
    const onStickyScroll = () => sync(sticky);
    header.addEventListener('scroll', onHeaderScroll, { passive: true });
    sticky.addEventListener('scroll', onStickyScroll);

    const tableContainer = tableContainerRef.current;
    const onWheel = (e: WheelEvent) => {
      if (sticky.contains(e.target as Node)) {
        return;
      }
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        return;
      }
      e.preventDefault();
      let delta = e.deltaX;
      if (e.deltaMode === 1) delta *= 24;
      if (e.deltaMode === 2) delta *= sticky.clientWidth;
      sticky.scrollLeft += delta;
    };
    tableContainer?.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      ro.disconnect();
      header.removeEventListener('scroll', onHeaderScroll);
      sticky.removeEventListener('scroll', onStickyScroll);
      tableContainer?.removeEventListener('wheel', onWheel);
    };
  }, []);

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const getLocalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort(LocalPrescriptionSort);

  const getOwnRegionalPrescription = (prescriptionId: string) =>
    regionalPrescriptions.find(
      (r) => r.prescriptionId === prescriptionId && r.region === region
    );

  const getSubLocalPrescriptions = (prescriptionId: string) =>
    subLocalPrescriptions.filter((r) => r.prescriptionId === prescriptionId);

  const getPlan = (prescription: Prescription) =>
    programmingPlans.find((p) =>
      p.subPlans.some((sp) => sp.id === prescription.programmingSubPlanId)
    ) ?? programmingPlans[0];

  const getSubPlan = (prescription: Prescription) =>
    programmingPlans
      .flatMap((p) => p.subPlans)
      .find((sp) => sp.id === prescription.programmingSubPlanId);

  if (!allPrescriptions) {
    return null;
  }

  // REGIONAL-kind plans let the regional coordinator assign a laboratory
  // directly at region level (no department step) — see updateLaboratories
  // in hasLocalPrescriptionPermission. Only shown in regional mode, and only
  // when at least one displayed plan is actually REGIONAL-kind.
  const showLaboratoryColumn =
    !!region && programmingPlans.some((p) => p.distributionKind === 'REGIONAL');

  // Regional mode only shows prescriptions that already have a local
  // prescription for this region (mirrors ProgrammingLocalPrescriptionTable).
  const prescriptions = region
    ? allPrescriptions.filter((p) => !isNil(getOwnRegionalPrescription(p.id)))
    : allPrescriptions;

  const departmentList = region
    ? [...Regions[region].departments].sort(DepartmentSort)
    : [];
  const columnCount = region ? departmentList.length : RegionList.length;

  const planOrder = [...new Set(prescriptions.map((p) => p.programmingPlanId))];
  const prescriptionsByPlan = groupBy(prescriptions, 'programmingPlanId');

  // Department columns are only meaningful for SLAUGHTERHOUSE-kind plans. If
  // none of the currently visible plans are SLAUGHTERHOUSE, every row is N/A
  // for those columns, so the grand-total row must show N/A too instead of 0.
  const hasVisibleSlaughterhousePlan = planOrder.some(
    (planId) =>
      programmingPlans.find((p) => p.id === planId)?.distributionKind ===
      'SLAUGHTERHOUSE'
  );

  // Only count regional/departmental prescriptions for currently visible
  // prescriptions (prescriptions may be filtered by matrixQuery / missing filters)
  const visiblePrescriptionIds = new Set(prescriptions.map((p) => p.id));
  const visibleRegionalPrescriptions = regionalPrescriptions.filter((r) =>
    visiblePrescriptionIds.has(r.prescriptionId)
  );
  const visibleSubLocalPrescriptions = subLocalPrescriptions.filter((r) =>
    visiblePrescriptionIds.has(r.prescriptionId)
  );

  return (
    <div
      data-testid="prescription-table"
      className={clsx('programming-table', {
        'programming-table--with-laboratory-column': showLaboratoryColumn,
        'programming-table--with-checkbox-column': showCheckboxColumn
      })}
      ref={tableContainerRef}
    >
      <div
        className="header-wrapper"
        ref={headerWrapperRef}
        style={{ top: topOffset }}
      >
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
            'fr-table--no-caption',
            'fr-table--no-scroll'
          )}
        >
          <table>
            <Colgroup
              columnCount={columnCount}
              showLaboratoryColumn={showLaboratoryColumn}
              showCheckboxColumn={showCheckboxColumn}
            />
            <thead>
              <tr>
                {showCheckboxColumn && (
                  <th scope="col" className="checkbox-cell">
                    <SelectionCheckbox
                      variant="header"
                      {...getSelectionState(prescriptions)}
                      onChange={() => toggleGroupSelection(prescriptions)}
                    />
                  </th>
                )}
                <th scope="col" className="n-cell">
                  N°
                </th>
                <th scope="col" className={clsx('matrice-cell', 'border-left')}>
                  Matrice
                </th>
                <th scope="col" className={clsx('analyte-cell', 'border-left')}>
                  Analyte
                </th>
                {showLaboratoryColumn && (
                  <th
                    scope="col"
                    className={clsx('laboratoire-cell', 'border-left')}
                  >
                    Attribution des laboratoires
                  </th>
                )}
                <th
                  scope="col"
                  className={clsx(
                    'prelevements-cell',
                    'border-left',
                    'border-right'
                  )}
                >
                  Prélèvements
                  <br />
                  programmés
                </th>
                {region
                  ? departmentList.map((department, columnIdx) => (
                      <th
                        scope="col"
                        className={clsx(
                          { 'border-left': columnIdx !== 0 },
                          cx('fr-p-1w')
                        )}
                        key={`header-${department}`}
                      >
                        <TableHeaderCell
                          shortName={department}
                          name={DepartmentLabels[department]}
                        />
                      </th>
                    ))
                  : RegionList.map((regionColumn, columnIdx) => (
                      <th
                        scope="col"
                        className={clsx(
                          { 'border-left': columnIdx !== 0 },
                          cx('fr-p-1w')
                        )}
                        key={`header-${regionColumn}`}
                      >
                        <TableHeaderCell
                          shortName={Regions[regionColumn].shortName}
                          name={Regions[regionColumn].name}
                        />
                      </th>
                    ))}
              </tr>
              <tr className="total-row">
                {showCheckboxColumn && <td className="checkbox-cell" />}
                <td
                  colSpan={showLaboratoryColumn ? 4 : 3}
                  className={clsx('n-cell', cx('fr-text--bold'))}
                >
                  Total prélèvements
                </td>
                <td
                  className={clsx(
                    'prelevements-cell',
                    cx('fr-text--bold'),
                    'border-left',
                    'border-right',
                    'align-center'
                  )}
                >
                  {region
                    ? sumBy(
                        visibleRegionalPrescriptions.filter(
                          (r) => r.region === region
                        ),
                        'sampleCount'
                      )
                    : sumBy(prescriptions, 'sampleCount')}
                </td>
                {region
                  ? departmentList.map((department, columnIdx) => (
                      <td
                        key={`total-${department}`}
                        className={clsx(
                          cx('fr-text--bold'),
                          { 'border-left': columnIdx !== 0 },
                          'align-center'
                        )}
                      >
                        {hasVisibleSlaughterhousePlan
                          ? sumBy(
                              visibleSubLocalPrescriptions.filter(
                                (r) => r.department === department
                              ),
                              'sampleCount'
                            )
                          : 'N/A'}
                      </td>
                    ))
                  : RegionList.map((regionColumn, columnIdx) => (
                      <td
                        key={`total-${regionColumn}`}
                        className={clsx(
                          cx('fr-text--bold'),
                          { 'border-left': columnIdx !== 0 },
                          'align-center'
                        )}
                      >
                        {sumBy(
                          visibleRegionalPrescriptions.filter(
                            (r) => r.region === regionColumn
                          ),
                          'sampleCount'
                        )}
                      </td>
                    ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {planOrder.map((planId) => {
        const plan =
          programmingPlans.find((p) => p.id === planId) ?? programmingPlans[0];
        const planPrescriptions = prescriptionsByPlan[planId] ?? [];
        const contextOrder = [
          ...new Set(planPrescriptions.map((p) => p.context))
        ];
        const prescriptionsByContext = groupBy(planPrescriptions, 'context');

        return (
          <Fragment key={`plan-group-${planId}`}>
            {contextOrder.map((context) => {
              const contextPrescriptions =
                prescriptionsByContext[context] ?? [];
              const contextPrescriptionIds = contextPrescriptions.map(
                (p) => p.id
              );
              const contextRegionalPrescriptions = regionalPrescriptions.filter(
                (r) => contextPrescriptionIds.includes(r.prescriptionId)
              );
              const contextSubLocalPrescriptions = subLocalPrescriptions.filter(
                (r) => contextPrescriptionIds.includes(r.prescriptionId)
              );

              return (
                <Fragment key={`plan-group-${planId}-${context}`}>
                  <div
                    className="plan-group-sticky-container"
                    style={{ top: topOffset + headerHeight }}
                  >
                    <div
                      className={clsx(
                        cx('fr-text--sm', 'fr-mb-0'),
                        'plan-group-title'
                      )}
                    >
                      {[
                        ProgrammingPlanDomainLabels[plan.domain],
                        plan.title,
                        ContextLabels[context]
                      ].join(' | ')}
                    </div>

                    <div
                      className="table-scroll-wrapper"
                      ref={(el) => {
                        if (el) {
                          rowWrapperRefs.current.set(
                            toPlanHeaderRowKey(planId, context),
                            el
                          );
                        } else {
                          rowWrapperRefs.current.delete(
                            toPlanHeaderRowKey(planId, context)
                          );
                        }
                      }}
                      onScroll={(e) => sync(e.currentTarget)}
                    >
                      <div
                        className={clsx(
                          'fr-table',
                          'fr-table--bordered',
                          'fr-table--no-caption',
                          'fr-table--no-scroll'
                        )}
                      >
                        <table>
                          <Colgroup
                            columnCount={columnCount}
                            showLaboratoryColumn={showLaboratoryColumn}
                            showCheckboxColumn={showCheckboxColumn}
                          />
                          <tbody>
                            <tr className="plan-group-header-row plan-group-total-row">
                              {showCheckboxColumn && (
                                <td className="checkbox-cell">
                                  <SelectionCheckbox
                                    variant="header"
                                    {...getSelectionState(contextPrescriptions)}
                                    onChange={() =>
                                      toggleGroupSelection(contextPrescriptions)
                                    }
                                  />
                                </td>
                              )}
                              <td
                                className="n-cell"
                                colSpan={showLaboratoryColumn ? 4 : 3}
                              >
                                Total prélèvements
                              </td>
                              <td
                                className={clsx(
                                  'prelevements-cell',
                                  'border-left',
                                  'border-right',
                                  'align-center'
                                )}
                              >
                                {region
                                  ? sumBy(
                                      contextRegionalPrescriptions.filter(
                                        (r) => r.region === region
                                      ),
                                      'sampleCount'
                                    )
                                  : sumBy(contextPrescriptions, 'sampleCount')}
                              </td>
                              {region
                                ? departmentList.map((department) => (
                                    <td
                                      key={department}
                                      className={clsx('align-center', {
                                        'border-left':
                                          department !== departmentList[0]
                                      })}
                                    >
                                      {plan.distributionKind ===
                                      'SLAUGHTERHOUSE'
                                        ? sumBy(
                                            contextSubLocalPrescriptions.filter(
                                              (r) => r.department === department
                                            ),
                                            'sampleCount'
                                          )
                                        : 'N/A'}
                                    </td>
                                  ))
                                : RegionList.map((regionColumn, columnIdx) => (
                                    <td
                                      key={regionColumn}
                                      className={clsx('align-center', {
                                        'border-left': columnIdx !== 0
                                      })}
                                    >
                                      {sumBy(
                                        contextRegionalPrescriptions.filter(
                                          (r) => r.region === regionColumn
                                        ),
                                        'sampleCount'
                                      )}
                                    </td>
                                  ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {contextPrescriptions.map((prescription) => {
                    const subPlan = getSubPlan(prescription);
                    const plan = getPlan(prescription);
                    const localPrescriptions = getLocalPrescriptions(
                      prescription.id
                    );
                    const totalSampleCount = sumBy(
                      localPrescriptions,
                      'sampleCount'
                    );
                    const isExpanded = expandedIds.has(prescription.id);
                    const showDistributionBadge =
                      prescription.sampleCount !== 0 || totalSampleCount !== 0;
                    const ownRegionalPrescription = region
                      ? getOwnRegionalPrescription(prescription.id)
                      : undefined;
                    const rowSubLocalPrescriptions = region
                      ? getSubLocalPrescriptions(prescription.id)
                      : [];
                    const regionDistributedCount = sumBy(
                      rowSubLocalPrescriptions,
                      'sampleCount'
                    );
                    const showRegionDistributionBadge =
                      plan.distributionKind === 'SLAUGHTERHOUSE' &&
                      ((ownRegionalPrescription?.sampleCount ?? 0) !== 0 ||
                        regionDistributedCount !== 0);

                    return (
                      <Fragment key={prescription.id}>
                        <div
                          className="table-scroll-wrapper"
                          ref={(el) => {
                            if (el) {
                              rowWrapperRefs.current.set(
                                toPrescriptionRowKey(prescription.id),
                                el
                              );
                            } else {
                              rowWrapperRefs.current.delete(
                                toPrescriptionRowKey(prescription.id)
                              );
                            }
                          }}
                          onScroll={(e) => sync(e.currentTarget)}
                        >
                          <div
                            className={clsx(
                              'fr-table',
                              'fr-table--bordered',
                              'fr-table--no-caption',
                              'fr-table--no-scroll'
                            )}
                          >
                            <table>
                              <Colgroup
                                columnCount={columnCount}
                                showLaboratoryColumn={showLaboratoryColumn}
                                showCheckboxColumn={showCheckboxColumn}
                              />
                              <tbody>
                                <tr>
                                  {showCheckboxColumn && (
                                    <td className="checkbox-cell">
                                      <SelectionCheckbox
                                        checked={isPrescriptionSelected(
                                          prescription
                                        )}
                                        onChange={() =>
                                          onTogglePrescriptionSelection?.(
                                            prescription
                                          )
                                        }
                                      />
                                    </td>
                                  )}
                                  <td className="n-cell">
                                    <div className="row-reference">
                                      {subPlan?.subPlanNumber}
                                      <Button
                                        iconId={
                                          isExpanded
                                            ? 'fr-icon-arrow-up-s-line'
                                            : 'fr-icon-arrow-down-s-line'
                                        }
                                        priority="tertiary no outline"
                                        size="small"
                                        title={
                                          isExpanded
                                            ? 'Réduire'
                                            : 'Voir les détails'
                                        }
                                        onClick={() =>
                                          toggleExpand(prescription.id)
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td
                                    className={clsx(
                                      'matrice-cell',
                                      cx('fr-text--bold'),
                                      'border-left'
                                    )}
                                    data-testid={`matrix-${prescription.id}`}
                                  >
                                    {getPrescriptionTitle(prescription)}
                                  </td>
                                  <td
                                    className={clsx(
                                      'analyte-cell',
                                      'border-left'
                                    )}
                                  >
                                    {subPlan?.substanceKinds
                                      .map((sk) => SubstanceKindLabels[sk])
                                      .join(', ')}
                                  </td>
                                  {showLaboratoryColumn && (
                                    <td
                                      className={clsx(
                                        'laboratoire-cell',
                                        'border-left'
                                      )}
                                    >
                                      {plan.distributionKind === 'REGIONAL' &&
                                      ownRegionalPrescription
                                        ? (() => {
                                            const substanceKindsLaboratories: SubstanceKindLaboratory[] =
                                              (ownRegionalPrescription
                                                .substanceKindsLaboratories
                                                ?.length ?? 0) > 0
                                                ? (ownRegionalPrescription.substanceKindsLaboratories as SubstanceKindLaboratory[])
                                                : (
                                                    subPlan?.substanceKinds ??
                                                    []
                                                  ).map((substanceKind) => ({
                                                    substanceKind,
                                                    laboratoryId: undefined
                                                  }));
                                            const isEditable =
                                              hasUserLocalPrescriptionPermission(
                                                plan,
                                                ownRegionalPrescription
                                              )?.updateLaboratories;
                                            const isLaboratoryPending =
                                              region &&
                                              pendingLaboratoryKeys?.has(
                                                toLocalPrescriptionKeyString({
                                                  prescriptionId:
                                                    prescription.id,
                                                  region,
                                                  department: undefined,
                                                  companySiret: undefined
                                                })
                                              );
                                            return substanceKindsLaboratories.map(
                                              (skl) => (
                                                <LaboratorySelect
                                                  key={skl.substanceKind}
                                                  programmingPlanId={plan.id}
                                                  programmingSubPlanId={
                                                    prescription.programmingSubPlanId
                                                  }
                                                  substanceKind={
                                                    skl.substanceKind
                                                  }
                                                  laboratoryId={
                                                    skl.laboratoryId
                                                  }
                                                  readonly={!isEditable}
                                                  pending={isLaboratoryPending}
                                                  hideLabel
                                                  onSelect={(laboratoryId) =>
                                                    onChangeLocalPrescriptionLaboratories?.(
                                                      {
                                                        prescriptionId:
                                                          prescription.id,
                                                        region: region as Region
                                                      },
                                                      substanceKindsLaboratories.map(
                                                        (x) =>
                                                          x.substanceKind ===
                                                          skl.substanceKind
                                                            ? {
                                                                ...x,
                                                                laboratoryId
                                                              }
                                                            : x
                                                      )
                                                    )
                                                  }
                                                />
                                              )
                                            );
                                          })()
                                        : null}
                                    </td>
                                  )}
                                  <td
                                    className={clsx(
                                      'prelevements-cell',
                                      'border-left',
                                      'border-right'
                                    )}
                                  >
                                    {region ? (
                                      plan.distributionKind === 'REGIONAL' &&
                                      ownRegionalPrescription ? (
                                        <DistributionCountCell
                                          programmingPlan={plan}
                                          prescription={prescription}
                                          localPrescription={
                                            ownRegionalPrescription
                                          }
                                          isEditable={
                                            hasUserLocalPrescriptionPermission(
                                              plan,
                                              ownRegionalPrescription
                                            )?.updateSampleCount
                                          }
                                          isPending={pendingLocalKeys?.has(
                                            toLocalPrescriptionKeyString({
                                              prescriptionId: prescription.id,
                                              region,
                                              department: undefined,
                                              companySiret: undefined
                                            })
                                          )}
                                          onChange={async (value) =>
                                            onChangeLocalPrescriptionCount(
                                              {
                                                prescriptionId: prescription.id,
                                                region
                                              },
                                              value
                                            )
                                          }
                                        />
                                      ) : (
                                        <div
                                          className={clsx(
                                            'prescription-sample-count-cell',
                                            'prescription-sample-count-cell--read'
                                          )}
                                        >
                                          <div>
                                            {ownRegionalPrescription?.sampleCount ??
                                              0}
                                          </div>
                                          {showRegionDistributionBadge && (
                                            <PrescriptionDistributionBadge
                                              sampleCount={
                                                ownRegionalPrescription?.sampleCount ??
                                                0
                                              }
                                              distributedCount={
                                                regionDistributedCount
                                              }
                                              small
                                            />
                                          )}
                                        </div>
                                      )
                                    ) : (
                                      <div
                                        className={clsx(
                                          'prescription-sample-count-cell',
                                          userRole &&
                                            hasPrescriptionPermission(
                                              userRole,
                                              plan
                                            ).update &&
                                            onChangePrescriptionSampleCount
                                            ? 'prescription-sample-count-cell--edit'
                                            : 'prescription-sample-count-cell--read'
                                        )}
                                      >
                                        {userRole &&
                                        hasPrescriptionPermission(
                                          userRole,
                                          plan
                                        ).update &&
                                        onChangePrescriptionSampleCount ? (
                                          <input
                                            className={clsx(
                                              'distribution-count-input',
                                              'distribution-count-input--wide',
                                              pendingPrescriptionIds?.has(
                                                prescription.id
                                              ) &&
                                                'distribution-count-input--pending'
                                            )}
                                            type="number"
                                            min={0}
                                            value={prescription.sampleCount}
                                            onChange={(e) => {
                                              const v = Number(e.target.value);
                                              if (!Number.isNaN(v)) {
                                                onChangePrescriptionSampleCount(
                                                  prescription,
                                                  v
                                                );
                                              }
                                            }}
                                          />
                                        ) : (
                                          <div>{prescription.sampleCount}</div>
                                        )}
                                        {showDistributionBadge && (
                                          <PrescriptionDistributionBadge
                                            sampleCount={
                                              prescription.sampleCount
                                            }
                                            distributedCount={totalSampleCount}
                                            small
                                          />
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  {region
                                    ? departmentList.map(
                                        (department, columnIdx) => {
                                          const localPrescription =
                                            rowSubLocalPrescriptions.find(
                                              (r) => r.department === department
                                            );
                                          return (
                                            <td
                                              className={clsx('align-center', {
                                                'border-left': columnIdx !== 0
                                              })}
                                              data-testid={`cell-${prescription.id}`}
                                              key={`cell-${prescription.id}-${department}`}
                                            >
                                              {localPrescription ? (
                                                <DistributionCountCell
                                                  programmingPlan={plan}
                                                  prescription={prescription}
                                                  localPrescription={
                                                    localPrescription
                                                  }
                                                  isEditable={
                                                    hasUserLocalPrescriptionPermission(
                                                      plan,
                                                      localPrescription
                                                    )?.distributeToDepartments
                                                  }
                                                  isPending={pendingLocalKeys?.has(
                                                    toLocalPrescriptionKeyString(
                                                      {
                                                        prescriptionId:
                                                          localPrescription.prescriptionId,
                                                        region:
                                                          localPrescription.region,
                                                        department:
                                                          localPrescription.department,
                                                        companySiret: undefined
                                                      }
                                                    )
                                                  )}
                                                  onChange={async (value) =>
                                                    onChangeLocalPrescriptionCount(
                                                      {
                                                        prescriptionId:
                                                          localPrescription.prescriptionId,
                                                        region:
                                                          localPrescription.region,
                                                        department:
                                                          localPrescription.department
                                                      },
                                                      value
                                                    )
                                                  }
                                                />
                                              ) : plan.distributionKind !==
                                                'SLAUGHTERHOUSE' ? (
                                                'N/A'
                                              ) : null}
                                            </td>
                                          );
                                        }
                                      )
                                    : localPrescriptions.map(
                                        (
                                          localPrescription,
                                          localPrescriptionIdx
                                        ) => (
                                          <td
                                            className={clsx({
                                              'border-left':
                                                localPrescriptionIdx !== 0
                                            })}
                                            data-testid={`cell-${prescription.id}`}
                                            key={`cell-${prescription.id}-${localPrescription.region}`}
                                          >
                                            <DistributionCountCell
                                              programmingPlan={plan}
                                              prescription={prescription}
                                              localPrescription={
                                                localPrescription
                                              }
                                              isEditable={
                                                hasUserLocalPrescriptionPermission(
                                                  plan,
                                                  localPrescription
                                                )?.updateSampleCount
                                              }
                                              isPending={pendingLocalKeys?.has(
                                                toLocalPrescriptionKeyString({
                                                  prescriptionId:
                                                    localPrescription.prescriptionId,
                                                  region:
                                                    localPrescription.region,
                                                  department: undefined,
                                                  companySiret: undefined
                                                })
                                              )}
                                              onChange={async (value) =>
                                                onChangeLocalPrescriptionCount(
                                                  {
                                                    prescriptionId:
                                                      localPrescription.prescriptionId,
                                                    region:
                                                      localPrescription.region
                                                  },
                                                  value
                                                )
                                              }
                                            />
                                          </td>
                                        )
                                      )}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="prescription-expanded-content">
                            <div className={cx('fr-grid-row')}>
                              <div className={cx('fr-col-3')}>
                                <div className={cx('fr-mb-3w')}>
                                  <div className="d-flex-align-center">
                                    <span
                                      className={cx(
                                        'fr-icon-chat-quote-line',
                                        'fr-pr-1v'
                                      )}
                                    />
                                    <b>Notes</b>
                                  </div>
                                  {prescription.notes ?? 'Aucune note'}
                                </div>
                                <div>
                                  <div className="d-flex-align-center">
                                    <span
                                      className={cx(
                                        'fr-icon-chat-quote-line',
                                        'fr-pr-1v'
                                      )}
                                    />
                                    <b>Consignes</b>
                                  </div>
                                  {prescription.programmingInstruction ??
                                    'Aucune consigne'}
                                </div>
                              </div>
                              <div className={cx('fr-col-3')}>
                                <PrescriptionSubstances
                                  programmingPlan={
                                    programmingPlans.find(
                                      (p) =>
                                        p.id === prescription.programmingPlanId
                                    ) ?? programmingPlans[0]
                                  }
                                  prescription={prescription}
                                  renderMode="inline"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}

      <div className="sticky-scrollbar" ref={stickyScrollRef}>
        <div ref={stickyInnerRef} />
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionTable;
