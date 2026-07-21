import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy } from 'lodash-es';
import {
  type Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  getPrescriptionTitle,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import {
  ContextLabels,
  type ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import {
  type ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  getPlanDepartmentalStatuses,
  getPlanRegionalStatuses,
  type ProgrammingPlanChecked
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { Fragment, useContext, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../../services/apiClient';
import './ProgrammingPlanRegionalValidationList.scss';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
}

type BadgeSeverity = 'success' | 'warning' | 'error' | 'info' | 'new';

const statusSeverity = (
  status: ProgrammingPlanStatus | undefined
): BadgeSeverity => {
  switch (status) {
    case 'InProgress':
      return 'warning';
    case 'SubmittedToRegion':
    case 'SubmittedToDepartments':
    case 'ApprovedByRegion':
      return 'info';
    case 'Validated':
    case 'Closed':
      return 'success';
    default:
      return 'new';
  }
};

const ProgrammingPlanRegionalValidationList = ({
  programmingPlan,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);

  const [expandedPrescriptionIds, setExpandedPrescriptionIds] = useState<
    Set<string>
  >(new Set());
  const [expandedRegionKeys, setExpandedRegionKeys] = useState<Set<string>>(
    new Set()
  );

  const togglePrescription = (id: string) =>
    setExpandedPrescriptionIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleRegion = (key: string) =>
    setExpandedRegionKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const findPrescriptionOptions = useMemo(
    () => ({ programmingPlanId: programmingPlan.id }),
    [programmingPlan.id]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
    }
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(
      { programmingPlanIds: [programmingPlan.id] },
      { skip: !programmingPlan.id }
    );

  const regionalStatuses = getPlanRegionalStatuses(programmingPlan);
  const departmentalStatuses = getPlanDepartmentalStatuses(programmingPlan);

  const contextOrder = useMemo(
    () => [...new Set(allPrescriptions?.map((p) => p.context) ?? [])],
    [allPrescriptions]
  );

  const prescriptionsByContext = useMemo(
    () => groupBy(allPrescriptions ?? [], 'context'),
    [allPrescriptions]
  );

  const getSubPlan = (prescription: Prescription) =>
    programmingPlan.subPlans.find(
      (sp) => sp.id === prescription.programmingSubPlanId
    );

  const regionsWithSamples = (prescriptionId: string) =>
    RegionList.filter((region) =>
      (regionalPrescriptions ?? []).some(
        (rp) =>
          rp.prescriptionId === prescriptionId &&
          rp.region === region &&
          rp.sampleCount > 0
      )
    );

  const regionalStatus = (region: string) =>
    regionalStatuses.find((rs) => rs.region === region)?.status;

  const nationalStatus = (prescription: Prescription) =>
    getSubPlan(prescription)?.localStatuses.find(
      (localStatus) =>
        localStatus.region === 'None' && localStatus.department === 'None'
    )?.status;

  const departmentalStatus = (region: string, department: string) =>
    departmentalStatuses.find(
      (ds) => ds.region === region && ds.department === department
    )?.status;

  const departmentsWithPrescriptions = (
    prescriptionId: string,
    region: string
  ): Department[] =>
    (Regions[region as keyof typeof Regions]?.departments ?? []).filter(
      (dept) =>
        (regionalPrescriptions ?? []).some(
          (rp) =>
            rp.prescriptionId === prescriptionId &&
            rp.region === region &&
            rp.department === dept &&
            rp.sampleCount > 0
        ) ||
        departmentalStatuses.some(
          (ds) => ds.region === region && ds.department === dept
        )
    ) as Department[];

  if (!allPrescriptions || !regionalPrescriptions) {
    return null;
  }

  return (
    <div
      className="programming-table validation-table"
      data-testid="validation-table"
    >
      {/* Sticky header */}
      <div className="header-wrapper">
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
            'fr-table--no-caption',
            'fr-table--no-scroll'
          )}
        >
          <table>
            <colgroup>
              <col className="col-name" />
              <col className="col-status" />
              <col className="col-status" />
              <col className="col-status" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Nom du plan</th>
                <th scope="col" className="border-left">
                  Statut BGIR
                </th>
                <th scope="col" className="border-left">
                  Statut région
                </th>
                <th scope="col" className="border-left">
                  Statut département
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* Plan × context groups */}
      {contextOrder.map((context) => {
        const contextPrescriptions = prescriptionsByContext[context] ?? [];

        return (
          <Fragment key={`group-${programmingPlan.id}-${context}`}>
            {/* Blue group header */}
            <div
              className="plan-group-sticky-container"
              style={{ top: 0 /* header has no dynamic height here */ }}
            >
              <div
                className={clsx(
                  cx('fr-text--sm', 'fr-mb-0'),
                  'plan-group-title'
                )}
              >
                {[
                  ProgrammingPlanDomainLabels[programmingPlan.domain],
                  programmingPlan.title,
                  ContextLabels[context as ProgrammingPlanContext]
                ].join(' | ')}
              </div>
            </div>

            {/* Prescription rows */}
            {contextPrescriptions.map((prescription) => {
              const isExpanded = expandedPrescriptionIds.has(prescription.id);
              const subPlan = getSubPlan(prescription);
              const regions = regionsWithSamples(prescription.id);
              const submittedCount = regions.filter((r) => {
                const s = regionalStatus(r);
                return s && !['InProgress', 'SubmittedToRegion'].includes(s);
              }).length;

              return (
                <Fragment key={prescription.id}>
                  {/* Prescription row */}
                  <div
                    className={clsx(
                      'fr-table',
                      'fr-table--bordered',
                      'fr-table--no-caption',
                      'fr-table--no-scroll'
                    )}
                  >
                    <table>
                      <colgroup>
                        <col className="col-name" />
                        <col className="col-status" />
                        <col className="col-status" />
                        <col className="col-status" />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td>
                            <div className="row-reference">
                              <span className="row-reference__number">
                                {subPlan?.subPlanNumber}
                              </span>
                              <Button
                                iconId={
                                  isExpanded
                                    ? 'fr-icon-arrow-up-s-line'
                                    : 'fr-icon-arrow-down-s-line'
                                }
                                priority="tertiary no outline"
                                size="small"
                                title={
                                  isExpanded ? 'Réduire' : 'Voir les détails'
                                }
                                onClick={() =>
                                  togglePrescription(prescription.id)
                                }
                              />
                              <span className={cx('fr-text--bold')}>
                                {getPrescriptionTitle(prescription)}
                              </span>
                            </div>
                          </td>
                          <td className="border-left align-center">
                            {nationalStatus(prescription) ? (
                              <Badge
                                noIcon
                                small
                                severity={statusSeverity(
                                  nationalStatus(prescription)
                                )}
                              >
                                {
                                  ProgrammingPlanStatusLabels[
                                    nationalStatus(
                                      prescription
                                    ) as ProgrammingPlanStatus
                                  ]
                                }
                              </Badge>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td className="border-left align-center">
                            {regions.length > 0 ? (
                              `${submittedCount}/${regions.length} région${regions.length > 1 ? 's' : ''}`
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td className="border-left align-center">
                            {/* dept summary shown at region level */}
                          </td>
                        </tr>

                        {/* Region sub-rows */}
                        {isExpanded &&
                          regions.map((region) => {
                            const regStatus = regionalStatus(region);
                            const regionKey = `${prescription.id}-${region}`;
                            const isRegionExpanded =
                              expandedRegionKeys.has(regionKey);
                            const depts = departmentsWithPrescriptions(
                              prescription.id,
                              region
                            );
                            const submittedDeptsCount = depts.filter((d) => {
                              const s = departmentalStatus(region, d);
                              return (
                                s &&
                                ![
                                  'InProgress',
                                  'SubmittedToDepartments'
                                ].includes(s)
                              );
                            }).length;

                            return (
                              <Fragment key={region}>
                                <tr className="region-row">
                                  <td className="indent-1">
                                    <div className="row-reference">
                                      {depts.length > 0 && (
                                        <Button
                                          iconId={
                                            isRegionExpanded
                                              ? 'fr-icon-arrow-up-s-line'
                                              : 'fr-icon-arrow-down-s-line'
                                          }
                                          priority="tertiary no outline"
                                          size="small"
                                          title={
                                            isRegionExpanded
                                              ? 'Réduire'
                                              : 'Voir les départements'
                                          }
                                          onClick={() =>
                                            toggleRegion(regionKey)
                                          }
                                        />
                                      )}
                                      {Regions[region as keyof typeof Regions]
                                        ?.name ?? region}
                                    </div>
                                  </td>
                                  <td className="border-left align-center">
                                    <span className="text-muted"> </span>
                                  </td>
                                  <td className="border-left align-center">
                                    {regStatus ? (
                                      <Badge
                                        noIcon
                                        small
                                        severity={statusSeverity(regStatus)}
                                      >
                                        {ProgrammingPlanStatusLabels[regStatus]}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted">N/A</span>
                                    )}
                                  </td>
                                  <td className="border-left align-center">
                                    {depts.length > 0
                                      ? `${submittedDeptsCount}/${depts.length} dépt`
                                      : null}
                                  </td>
                                </tr>

                                {/* Department sub-rows */}
                                {isRegionExpanded &&
                                  depts.map((dept) => {
                                    const deptStatus = departmentalStatus(
                                      region,
                                      dept
                                    );
                                    return (
                                      <tr key={dept} className="dept-row">
                                        <td className="indent-2">
                                          {DepartmentLabels[dept]} ({dept})
                                        </td>
                                        <td className="border-left" />
                                        <td className="border-left" />
                                        <td className="border-left align-center">
                                          {deptStatus ? (
                                            <Badge
                                              noIcon
                                              small
                                              severity={statusSeverity(
                                                deptStatus
                                              )}
                                            >
                                              {
                                                ProgrammingPlanStatusLabels[
                                                  deptStatus
                                                ]
                                              }
                                            </Badge>
                                          ) : (
                                            <span className="text-muted">
                                              N/A
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
};

export default ProgrammingPlanRegionalValidationList;
