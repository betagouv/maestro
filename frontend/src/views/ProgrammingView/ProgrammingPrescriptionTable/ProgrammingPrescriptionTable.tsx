import Button from '@codegouvfr/react-dsfr/Button';
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
import { hasUnviewedChange } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionChange';
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
  region?: Region;
  department?: Department;
  companies?: Company[];
  subLocalPrescriptions?: LocalPrescription[];
  selectedPrescriptions?: Prescription[];
  onTogglePrescriptionSelection?: (prescription: Prescription) => void;
  topOffset?: number;
}

const Colgroup = ({
  columnCount,
  showLaboratoryColumn,
  showCheckboxColumn,
  wideColumns
}: {
  columnCount: number;
  showLaboratoryColumn: boolean;
  showCheckboxColumn: boolean;
  wideColumns: boolean;
}) => (
  <colgroup>
    {showCheckboxColumn && <col className="col-checkbox" />}
    <col className="col-n" />
    <col className="col-matrice" />
    <col className="col-analyte" />
    {showLaboratoryColumn && <col className="col-laboratoire" />}
    <col className="col-prelevements" />
    {Array.from({ length: columnCount }, (_, i) => (
      <col
        key={`col-${i}`}
        className={wideColumns ? 'col-company' : 'col-region'}
      />
    ))}
  </colgroup>
);

const PrescriptionSampleCountInput = ({
  value,
  isPending,
  onChange
}: {
  value: number;
  isPending?: boolean;
  onChange: (value: number) => void;
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value === 0) {
      setInputValue('');
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = Number(e.target.value);
    if (!Number.isNaN(newValue) && newValue !== value) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      setInputValue(String(value));
    }
  };

  return (
    <input
      className={clsx(
        'distribution-count-input',
        'distribution-count-input--wide',
        isPending && 'distribution-count-input--pending'
      )}
      type="number"
      min={0}
      value={inputValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

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
  topOffset = 0
}: Props) => {
  const { hasUserLocalPrescriptionPermission, userRole } = useAuthentication();
  const showCheckboxColumn = !!onTogglePrescriptionSelection;
  const isSamplerView = userRole === 'Sampler';

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

  const prescriptionIdsKey = allPrescriptions.map((p) => p.id).join(',');
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

  const departmentList = region
    ? [...Regions[region].departments].sort(DepartmentSort)
    : [];
  const columnCount = isSamplerView
    ? 0
    : department
      ? companies.length
      : region
        ? departmentList.length
        : RegionList.length;

  const planOrder = [...new Set(prescriptions.map((p) => p.programmingPlanId))];
  const prescriptionsByPlan = groupBy(prescriptions, 'programmingPlanId');

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
                            wideColumns={!!department}
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
                    const rowHasUnviewedChange = hasUnviewedChange(
                      ownRegionalPrescription?.changedAt
                    );
                    const showRowLaboratoryCells =
                      (plan.distributionKind === 'REGIONAL' ||
                        (plan.distributionKind === 'SLAUGHTERHOUSE' &&
                          department)) &&
                      !!ownRegionalPrescription;
                    const rowSubstanceKindsLaboratories: SubstanceKindLaboratory[] =
                      showRowLaboratoryCells
                        ? (ownRegionalPrescription?.substanceKindsLaboratories
                            ?.length ?? 0) > 0
                          ? (ownRegionalPrescription?.substanceKindsLaboratories as SubstanceKindLaboratory[])
                          : (subPlan?.substanceKinds ?? []).map(
                              (substanceKind) => ({
                                substanceKind,
                                laboratoryId: undefined
                              })
                            )
                        : [];

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
                                wideColumns={!!department}
                              />
                              <tbody>
                                <tr
                                  className={clsx(
                                    rowHasUnviewedChange &&
                                      'prescription-row--changed'
                                  )}
                                >
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
                                    {showRowLaboratoryCells ? (
                                      <div className="analyte-lines">
                                        {rowSubstanceKindsLaboratories.map(
                                          (skl) => (
                                            <div key={skl.substanceKind}>
                                              {
                                                SubstanceKindLabels[
                                                  skl.substanceKind
                                                ]
                                              }
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      subPlan?.substanceKinds
                                        .map((sk) => SubstanceKindLabels[sk])
                                        .join(', ')
                                    )}
                                  </td>
                                  {showLaboratoryColumn && (
                                    <td
                                      className={clsx(
                                        'laboratoire-cell',
                                        'border-left'
                                      )}
                                    >
                                      {showRowLaboratoryCells
                                        ? (() => {
                                            const substanceKindsLaboratories =
                                              rowSubstanceKindsLaboratories;
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
                                                <div
                                                  className="lab-line"
                                                  key={skl.substanceKind}
                                                >
                                                  <LaboratorySelect
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
                                                    pending={
                                                      isLaboratoryPending
                                                    }
                                                    hideLabel
                                                    onSelect={(laboratoryId) =>
                                                      onChangeLocalPrescriptionLaboratories?.(
                                                        {
                                                          prescriptionId:
                                                            prescription.id,
                                                          region:
                                                            region as Region
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
                                                </div>
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
                                    {region && rowHasUnviewedChange && (
                                      <span
                                        className={clsx(
                                          cx(
                                            'fr-icon-flashlight-fill',
                                            'fr-icon--sm'
                                          ),
                                          'prescription-sample-count-cell-icon'
                                        )}
                                        aria-hidden
                                      />
                                    )}
                                    {region ? (
                                      plan.distributionKind === 'REGIONAL' &&
                                      ownRegionalPrescription ? (
                                        <div
                                          className={clsx(
                                            'prescription-sample-count-cell',
                                            rowHasUnviewedChange &&
                                              'prescription-sample-count-cell--changed'
                                          )}
                                        >
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
                                                  prescriptionId:
                                                    prescription.id,
                                                  region
                                                },
                                                value
                                              )
                                            }
                                          />
                                          {rowHasUnviewedChange && (
                                            <div className="previous-sample-count">
                                              Avant :{' '}
                                              {ownRegionalPrescription.previousSampleCount ??
                                                0}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div
                                          className={clsx(
                                            'prescription-sample-count-cell',
                                            'prescription-sample-count-cell--read',
                                            rowHasUnviewedChange &&
                                              'prescription-sample-count-cell--changed'
                                          )}
                                        >
                                          <div className="prescription-sample-count-cell__value-row">
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
                                          {rowHasUnviewedChange && (
                                            <div className="previous-sample-count">
                                              Avant :{' '}
                                              {ownRegionalPrescription?.previousSampleCount ??
                                                0}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    ) : (
                                      (() => {
                                        const isNationalEditable =
                                          userRole &&
                                          hasPrescriptionPermission(
                                            userRole,
                                            plan
                                          ).update &&
                                          onChangePrescriptionSampleCount;
                                        return (
                                          <div
                                            className={clsx(
                                              'prescription-sample-count-cell',
                                              isNationalEditable
                                                ? 'prescription-sample-count-cell--edit'
                                                : 'prescription-sample-count-cell--read'
                                            )}
                                          >
                                            {isNationalEditable ? (
                                              <>
                                                <PrescriptionSampleCountInput
                                                  value={
                                                    prescription.sampleCount
                                                  }
                                                  isPending={pendingPrescriptionIds?.has(
                                                    prescription.id
                                                  )}
                                                  onChange={(v) =>
                                                    onChangePrescriptionSampleCount(
                                                      prescription,
                                                      v
                                                    )
                                                  }
                                                />
                                                {showDistributionBadge && (
                                                  <PrescriptionDistributionBadge
                                                    sampleCount={
                                                      prescription.sampleCount
                                                    }
                                                    distributedCount={
                                                      totalSampleCount
                                                    }
                                                    small
                                                  />
                                                )}
                                              </>
                                            ) : (
                                              <div className="prescription-sample-count-cell__value-row">
                                                <div>
                                                  {prescription.sampleCount}
                                                </div>
                                                {showDistributionBadge && (
                                                  <PrescriptionDistributionBadge
                                                    sampleCount={
                                                      prescription.sampleCount
                                                    }
                                                    distributedCount={
                                                      totalSampleCount
                                                    }
                                                    small
                                                  />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()
                                    )}
                                  </td>
                                  {!isSamplerView &&
                                    (department
                                      ? companies.map((company, columnIdx) => {
                                          const localPrescription =
                                            rowSubLocalPrescriptions.find(
                                              (r) =>
                                                r.companySiret === company.siret
                                            ) ?? {
                                              prescriptionId: prescription.id,
                                              region: region as Region,
                                              department,
                                              companySiret: company.siret,
                                              sampleCount: 0
                                            };
                                          return (
                                            <td
                                              className={clsx('align-center', {
                                                'border-left': columnIdx !== 0
                                              })}
                                              data-testid={`cell-${prescription.id}`}
                                              key={`cell-${prescription.id}-${company.siret}`}
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
                                                  )?.distributeToSlaughterhouses
                                                }
                                                isPending={pendingLocalKeys?.has(
                                                  toLocalPrescriptionKeyString({
                                                    prescriptionId:
                                                      localPrescription.prescriptionId,
                                                    region:
                                                      localPrescription.region,
                                                    department:
                                                      localPrescription.department,
                                                    companySiret:
                                                      localPrescription.companySiret
                                                  })
                                                )}
                                                onChange={async (value) =>
                                                  onChangeLocalPrescriptionCount(
                                                    {
                                                      prescriptionId:
                                                        localPrescription.prescriptionId,
                                                      region:
                                                        localPrescription.region,
                                                      department:
                                                        localPrescription.department,
                                                      companySiret:
                                                        localPrescription.companySiret
                                                    },
                                                    value
                                                  )
                                                }
                                              />
                                            </td>
                                          );
                                        })
                                      : region
                                        ? departmentList.map(
                                            (departmentColumn, columnIdx) => {
                                              const localPrescription =
                                                rowSubLocalPrescriptions.find(
                                                  (r) =>
                                                    r.department ===
                                                    departmentColumn
                                                );
                                              return (
                                                <td
                                                  className={clsx(
                                                    'align-center',
                                                    {
                                                      'border-left':
                                                        columnIdx !== 0
                                                    }
                                                  )}
                                                  data-testid={`cell-${prescription.id}`}
                                                  key={`cell-${prescription.id}-${departmentColumn}`}
                                                >
                                                  {localPrescription ? (
                                                    <DistributionCountCell
                                                      programmingPlan={plan}
                                                      prescription={
                                                        prescription
                                                      }
                                                      localPrescription={
                                                        localPrescription
                                                      }
                                                      isEditable={
                                                        hasUserLocalPrescriptionPermission(
                                                          plan,
                                                          localPrescription
                                                        )
                                                          ?.distributeToDepartments
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
                                                            companySiret:
                                                              undefined
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
                                                    toLocalPrescriptionKeyString(
                                                      {
                                                        prescriptionId:
                                                          localPrescription.prescriptionId,
                                                        region:
                                                          localPrescription.region,
                                                        department: undefined,
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
                                                          localPrescription.region
                                                      },
                                                      value
                                                    )
                                                  }
                                                />
                                              </td>
                                            )
                                          ))}
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
