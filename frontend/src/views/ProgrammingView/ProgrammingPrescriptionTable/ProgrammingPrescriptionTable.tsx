import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy, isNil, sumBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import {
  DepartmentLabels,
  DepartmentSort
} from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import type { Company } from 'maestro-shared/schema/Company/Company';
import {
  type LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type {
  LocalPrescriptionKey,
  LocalPrescriptionKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import SelectionCheckbox from 'src/components/SelectionCheckbox/SelectionCheckbox';
import TableHeaderCell from 'src/components/TableHeaderCell/TableHeaderCell';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import './ProgrammingPrescriptionTable.scss';
import ProgrammingPrescriptionRow from './ProgrammingPrescriptionRow';
import {
  Colgroup,
  type RowWrapperKey,
  toPlanHeaderRowKey,
  toPrescriptionRowKey
} from './ProgrammingPrescriptionTableParts';

const INITIAL_ROW_COUNT = 60;
const ROW_CHUNK_SIZE = 120;

const useProgressiveRowCount = (total: number) => {
  const [renderedCount, setRenderedCount] = useState(INITIAL_ROW_COUNT);

  useEffect(() => {
    setRenderedCount(INITIAL_ROW_COUNT);
  }, [total]);

  useEffect(() => {
    if (renderedCount >= total) {
      return;
    }
    const handle = window.requestIdleCallback(() =>
      setRenderedCount((count) => Math.min(count + ROW_CHUNK_SIZE, total))
    );
    return () => window.cancelIdleCallback(handle);
  }, [renderedCount, total]);

  return renderedCount;
};

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
  region?: Region;
  department?: Department;
  companies?: Company[];
  subLocalPrescriptions?: LocalPrescription[];
  selectedPrescriptions?: Prescription[];
  onTogglePrescriptionSelection?: (prescription: Prescription) => void;
  onOpenComments?: (prescription: Prescription) => void;
  topOffset?: number;
}

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
  department,
  companies = [],
  subLocalPrescriptions = [],
  selectedPrescriptions = [],
  onTogglePrescriptionSelection,
  onOpenComments,
  topOffset = 0
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { userRole } = useAuthentication();
  const { data: domains } = apiClient.useFindProgrammingPlanDomainsQuery();
  const domainLabels = useMemo(
    () =>
      Object.fromEntries((domains ?? []).map(({ id, label }) => [id, label])),
    [domains]
  );
  const showCheckboxColumn = !!onTogglePrescriptionSelection;
  const isSamplerView = userRole === 'Sampler';

  const selectedPrescriptionIds = useMemo(
    () => new Set(selectedPrescriptions.map((p) => p.id)),
    [selectedPrescriptions]
  );

  const isPrescriptionSelected = (prescription: Prescription) =>
    selectedPrescriptionIds.has(prescription.id);

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

  const [headerHeight, setHeaderHeight] = useState(0);
  const syncingRef = useRef(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const rowWrapperRefs = useRef<Map<RowWrapperKey, HTMLDivElement>>(new Map());
  const visibleRowWrappersRef = useRef<Set<HTMLDivElement>>(new Set());
  const rowObserverRef = useRef<IntersectionObserver | null>(null);
  const scrollLeftRef = useRef(0);
  const syncFrameRef = useRef<number | null>(null);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);

  const applyScrollLeft = (el: HTMLDivElement | null, scrollLeft: number) => {
    if (el && el.scrollLeft !== scrollLeft) {
      el.scrollLeft = scrollLeft;
    }
  };

  const sync = useCallback((source: HTMLDivElement) => {
    if (syncingRef.current) {
      return;
    }
    scrollLeftRef.current = source.scrollLeft;
    if (syncFrameRef.current !== null) {
      return;
    }
    syncFrameRef.current = requestAnimationFrame(() => {
      syncFrameRef.current = null;
      const scrollLeft = scrollLeftRef.current;
      syncingRef.current = true;
      applyScrollLeft(headerWrapperRef.current, scrollLeft);
      applyScrollLeft(stickyScrollRef.current, scrollLeft);
      visibleRowWrappersRef.current.forEach((el) => {
        applyScrollLeft(el, scrollLeft);
      });
      requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    });
  }, []);

  useEffect(
    () => () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            visibleRowWrappersRef.current.add(el);
            applyScrollLeft(el, scrollLeftRef.current);
          } else {
            visibleRowWrappersRef.current.delete(el);
          }
        }
      },
      { rootMargin: '400px 0px' }
    );
    rowObserverRef.current = observer;
    rowWrapperRefs.current.forEach((el) => {
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      rowObserverRef.current = null;
      visibleRowWrappersRef.current.clear();
    };
  }, []);

  const registerRowWrapper = useCallback(
    (prescriptionId: string, el: HTMLDivElement | null) => {
      const rowKey = toPrescriptionRowKey(prescriptionId);
      const previous = rowWrapperRefs.current.get(rowKey);
      if (previous && previous !== el) {
        rowObserverRef.current?.unobserve(previous);
        visibleRowWrappersRef.current.delete(previous);
      }
      if (el) {
        rowWrapperRefs.current.set(rowKey, el);
        applyScrollLeft(el, scrollLeftRef.current);
        rowObserverRef.current?.observe(el);
      } else {
        rowWrapperRefs.current.delete(rowKey);
      }
    },
    []
  );

  const prescriptionIdsKey = useMemo(
    () => allPrescriptions.map((p) => p.id).join(','),
    [allPrescriptions]
  );
  useEffect(() => {
    if (headerWrapperRef.current) {
      headerWrapperRef.current.scrollLeft = 0;
    }
    if (stickyScrollRef.current) {
      stickyScrollRef.current.scrollLeft = 0;
    }
    scrollLeftRef.current = 0;
    rowWrapperRefs.current.forEach((el) => {
      el.scrollLeft = 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionIdsKey]);

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

  const localPrescriptionsByPrescriptionId = useMemo(() => {
    const index = new Map<string, LocalPrescription[]>();
    for (const localPrescription of regionalPrescriptions) {
      const list = index.get(localPrescription.prescriptionId);
      if (list) {
        list.push(localPrescription);
      } else {
        index.set(localPrescription.prescriptionId, [localPrescription]);
      }
    }
    for (const list of index.values()) {
      list.sort(LocalPrescriptionSort);
    }
    return index;
  }, [regionalPrescriptions]);

  const ownRegionalPrescriptionByPrescriptionId = useMemo(() => {
    const index = new Map<string, LocalPrescription>();
    if (!region) {
      return index;
    }
    for (const localPrescription of regionalPrescriptions) {
      if (
        localPrescription.region === region &&
        !index.has(localPrescription.prescriptionId)
      ) {
        index.set(localPrescription.prescriptionId, localPrescription);
      }
    }
    return index;
  }, [regionalPrescriptions, region]);

  const subLocalPrescriptionsByPrescriptionId = useMemo(() => {
    const index = new Map<string, LocalPrescription[]>();
    for (const localPrescription of subLocalPrescriptions) {
      const list = index.get(localPrescription.prescriptionId);
      if (list) {
        list.push(localPrescription);
      } else {
        index.set(localPrescription.prescriptionId, [localPrescription]);
      }
    }
    return index;
  }, [subLocalPrescriptions]);

  const commentCountByPrescriptionId = useMemo(() => {
    const index = new Map<string, number>();
    for (const localPrescription of regionalPrescriptions) {
      if (!isNil(localPrescription.department)) {
        continue;
      }
      index.set(
        localPrescription.prescriptionId,
        (index.get(localPrescription.prescriptionId) ?? 0) +
          (localPrescription.comments ?? []).length
      );
    }
    return index;
  }, [regionalPrescriptions]);

  const getLocalPrescriptions = (prescriptionId: string) =>
    localPrescriptionsByPrescriptionId.get(prescriptionId) ?? [];

  const getOwnRegionalPrescription = (prescriptionId: string) =>
    ownRegionalPrescriptionByPrescriptionId.get(prescriptionId);

  const getSubLocalPrescriptions = (prescriptionId: string) =>
    subLocalPrescriptionsByPrescriptionId.get(prescriptionId) ?? [];

  const planBySubPlanId = useMemo(() => {
    const index = new Map<
      string,
      {
        plan: ProgrammingPlanChecked;
        subPlan: ProgrammingPlanChecked['subPlans'][number];
      }
    >();
    for (const plan of programmingPlans) {
      for (const subPlan of plan.subPlans) {
        if (!index.has(subPlan.id)) {
          index.set(subPlan.id, { plan, subPlan });
        }
      }
    }
    return index;
  }, [programmingPlans]);

  const getPlan = (prescription: Prescription) =>
    planBySubPlanId.get(prescription.programmingSubPlanId)?.plan ??
    programmingPlans[0];

  const getSubPlan = (prescription: Prescription) =>
    planBySubPlanId.get(prescription.programmingSubPlanId)?.subPlan;

  const renderedRowCount = useProgressiveRowCount(
    allPrescriptions?.length ?? 0
  );

  const departmentList = useMemo(
    () => (region ? [...Regions[region].departments].sort(DepartmentSort) : []),
    [region]
  );

  if (!allPrescriptions) {
    return null;
  }

  const showLaboratoryColumn =
    !!region &&
    userRole !== 'Sampler' &&
    programmingPlans.some(
      (p) =>
        p.distributionKind === 'REGIONAL' ||
        (p.distributionKind === 'SLAUGHTERHOUSE' && !!department)
    );

  const prescriptions = region
    ? allPrescriptions.filter((p) => !isNil(getOwnRegionalPrescription(p.id)))
    : allPrescriptions;

  const columnCount = isSamplerView
    ? 0
    : department
      ? companies.length
      : region
        ? departmentList.length
        : RegionList.length;

  const planOrder = [...new Set(prescriptions.map((p) => p.programmingPlanId))];
  const prescriptionsByPlan = groupBy(prescriptions, 'programmingPlanId');

  const renderedPrescriptionIds = new Set(
    planOrder
      .flatMap((planId) => {
        const planPrescriptions = prescriptionsByPlan[planId] ?? [];
        const byContext = groupBy(planPrescriptions, 'context');
        return [...new Set(planPrescriptions.map((p) => p.context))].flatMap(
          (context) => byContext[context] ?? []
        );
      })
      .slice(0, renderedRowCount)
      .map((p) => p.id)
  );

  const hasVisibleSlaughterhousePlan = planOrder.some(
    (planId) =>
      programmingPlans.find((p) => p.id === planId)?.distributionKind ===
      'SLAUGHTERHOUSE'
  );

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
              wideColumns={!!department}
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
                <th
                  scope="col"
                  className={clsx('prelevements-cell', 'border-left')}
                >
                  Prélèvements
                  <br />
                  programmés
                </th>
                {showLaboratoryColumn && (
                  <th
                    scope="col"
                    className={clsx('laboratoire-cell', 'border-right')}
                  >
                    Attribution des laboratoires
                  </th>
                )}
                {!isSamplerView &&
                  (department
                    ? companies.map((company, columnIdx) => (
                        <th
                          scope="col"
                          className={clsx(
                            { 'border-left': columnIdx !== 0 },
                            cx('fr-p-1w')
                          )}
                          key={`header-${company.siret}`}
                        >
                          <div className={cx('fr-text--xs', 'fr-text--light')}>
                            Abattoir
                          </div>
                          <div
                            className={clsx(
                              cx('fr-text--bold'),
                              'company-name'
                            )}
                            title={`${company.name}${company.city ? ` - ${company.city}` : ''}`}
                          >
                            {company.name}
                            {company.city ? ` - ${company.city}` : ''}
                          </div>
                        </th>
                      ))
                    : region
                      ? departmentList.map((departmentColumn, columnIdx) => (
                          <th
                            scope="col"
                            className={clsx(
                              { 'border-left': columnIdx !== 0 },
                              cx('fr-p-1w')
                            )}
                            key={`header-${departmentColumn}`}
                          >
                            <TableHeaderCell
                              shortName={departmentColumn}
                              name={DepartmentLabels[departmentColumn]}
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
                        )))}
              </tr>
              <tr className="total-row">
                {showCheckboxColumn && <td className="checkbox-cell" />}
                <td colSpan={3} className={clsx('n-cell', cx('fr-text--bold'))}>
                  Total prélèvements
                </td>
                <td
                  className={clsx(
                    'prelevements-cell',
                    cx('fr-text--bold'),
                    'border-left',
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
                {showLaboratoryColumn && (
                  <td className={clsx('laboratoire-cell', 'border-right')} />
                )}
                {!isSamplerView &&
                  (department
                    ? companies.map((company, columnIdx) => (
                        <td
                          key={`total-${company.siret}`}
                          className={clsx(
                            cx('fr-text--bold'),
                            { 'border-left': columnIdx !== 0 },
                            'align-center'
                          )}
                        >
                          {sumBy(
                            visibleSubLocalPrescriptions.filter(
                              (r) => r.companySiret === company.siret
                            ),
                            'sampleCount'
                          )}
                        </td>
                      ))
                    : region
                      ? departmentList.map((departmentColumn, columnIdx) => (
                          <td
                            key={`total-${departmentColumn}`}
                            className={clsx(
                              cx('fr-text--bold'),
                              { 'border-left': columnIdx !== 0 },
                              'align-center'
                            )}
                          >
                            {hasVisibleSlaughterhousePlan
                              ? sumBy(
                                  visibleSubLocalPrescriptions.filter(
                                    (r) => r.department === departmentColumn
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
                        )))}
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
              const contextPrescriptionIds = new Set(
                contextPrescriptions.map((p) => p.id)
              );
              const contextRegionalPrescriptions = regionalPrescriptions.filter(
                (r) => contextPrescriptionIds.has(r.prescriptionId)
              );
              const contextSubLocalPrescriptions = subLocalPrescriptions.filter(
                (r) => contextPrescriptionIds.has(r.prescriptionId)
              );

              return (
                <Fragment key={`plan-group-${planId}-${context}`}>
                  <div
                    className="plan-group-sticky-container"
                    style={{ top: topOffset + headerHeight }}
                  >
                    {showCheckboxColumn && (
                      <div className="plan-group-checkbox">
                        <SelectionCheckbox
                          variant="header"
                          {...getSelectionState(contextPrescriptions)}
                          onChange={() =>
                            toggleGroupSelection(contextPrescriptions)
                          }
                        />
                      </div>
                    )}
                    <div
                      className={clsx(
                        cx('fr-text--sm', 'fr-mb-0'),
                        'plan-group-title'
                      )}
                    >
                      {[
                        domainLabels[plan.domainId],
                        plan.title,
                        ContextLabels[context]
                      ]
                        .filter(Boolean)
                        .join(' | ')}
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
                            wideColumns={!!department}
                          />
                          <tbody>
                            <tr className="plan-group-header-row plan-group-total-row">
                              {showCheckboxColumn && (
                                <td className="checkbox-cell" />
                              )}
                              <td className="n-cell" colSpan={3}>
                                Total prélèvements
                              </td>
                              <td
                                className={clsx(
                                  'prelevements-cell',
                                  'border-left',
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
                              {showLaboratoryColumn && (
                                <td
                                  className={clsx(
                                    'laboratoire-cell',
                                    'border-right'
                                  )}
                                />
                              )}
                              {!isSamplerView &&
                                (department
                                  ? companies.map((company, columnIdx) => (
                                      <td
                                        key={company.siret}
                                        className={clsx('align-center', {
                                          'border-left': columnIdx !== 0
                                        })}
                                      >
                                        {sumBy(
                                          contextSubLocalPrescriptions.filter(
                                            (r) =>
                                              r.companySiret === company.siret
                                          ),
                                          'sampleCount'
                                        )}
                                      </td>
                                    ))
                                  : region
                                    ? departmentList.map((departmentColumn) => (
                                        <td
                                          key={departmentColumn}
                                          className={clsx('align-center', {
                                            'border-left':
                                              departmentColumn !==
                                              departmentList[0]
                                          })}
                                        >
                                          {plan.distributionKind ===
                                          'SLAUGHTERHOUSE'
                                            ? sumBy(
                                                contextSubLocalPrescriptions.filter(
                                                  (r) =>
                                                    r.department ===
                                                    departmentColumn
                                                ),
                                                'sampleCount'
                                              )
                                            : 'N/A'}
                                        </td>
                                      ))
                                    : RegionList.map(
                                        (regionColumn, columnIdx) => (
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
                                        )
                                      ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {contextPrescriptions
                    .filter((prescription) =>
                      renderedPrescriptionIds.has(prescription.id)
                    )
                    .map((prescription) => (
                      <ProgrammingPrescriptionRow
                        key={prescription.id}
                        prescription={prescription}
                        plan={getPlan(prescription)}
                        subPlan={getSubPlan(prescription)}
                        programmingPlans={programmingPlans}
                        localPrescriptions={getLocalPrescriptions(
                          prescription.id
                        )}
                        ownRegionalPrescription={
                          region
                            ? getOwnRegionalPrescription(prescription.id)
                            : undefined
                        }
                        rowSubLocalPrescriptions={
                          region
                            ? getSubLocalPrescriptions(prescription.id)
                            : []
                        }
                        rowCommentCount={
                          commentCountByPrescriptionId.get(prescription.id) ?? 0
                        }
                        isSelected={isPrescriptionSelected(prescription)}
                        isSamplerView={isSamplerView}
                        showCheckboxColumn={showCheckboxColumn}
                        showLaboratoryColumn={showLaboratoryColumn}
                        columnCount={columnCount}
                        departmentList={departmentList}
                        companies={companies}
                        region={region}
                        department={department}
                        pendingLocalKeys={pendingLocalKeys}
                        pendingLaboratoryKeys={pendingLaboratoryKeys}
                        pendingPrescriptionIds={pendingPrescriptionIds}
                        onChangeLocalPrescriptionCount={
                          onChangeLocalPrescriptionCount
                        }
                        onChangeLocalPrescriptionLaboratories={
                          onChangeLocalPrescriptionLaboratories
                        }
                        onChangePrescriptionSampleCount={
                          onChangePrescriptionSampleCount
                        }
                        onTogglePrescriptionSelection={
                          onTogglePrescriptionSelection
                        }
                        onOpenComments={onOpenComments}
                        registerRowWrapper={registerRowWrapper}
                        onRowScroll={sync}
                      />
                    ))}
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
