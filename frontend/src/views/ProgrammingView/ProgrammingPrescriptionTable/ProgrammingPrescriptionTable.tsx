import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy, sumBy } from 'lodash-es';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  type LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  type LocalPrescriptionKey,
  type LocalPrescriptionKeyString,
  toLocalPrescriptionKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
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
import type React from 'react';
import { Fragment, useRef, useState } from 'react';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import PrescriptionDistributionBadge from 'src/components/Prescription/PrescriptionDistributionBadge/PrescriptionDistributionBadge';
import TableHeaderCell from 'src/components/TableHeaderCell/TableHeaderCell';
import { useTableScrollSync } from 'src/hooks/useTableScrollSync';
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
}

const Colgroup = () => (
  <colgroup>
    <col className="col-n" />
    <col className="col-matrice" />
    <col className="col-analyte" />
    <col className="col-prelevements" />
    {RegionList.map((region) => (
      <col key={`col-${region}`} className="col-region" />
    ))}
  </colgroup>
);

const ProgrammingPrescriptionTable = ({
  programmingPlans,
  prescriptions,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount,
  onChangePrescriptionSampleCount,
  pendingPrescriptionIds,
  pendingLocalKeys
}: Props) => {
  const { hasUserLocalPrescriptionPermission, userRole } = useAuthentication();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const {
    tableContainerRef,
    headerWrapperRef,
    rowWrapperRefs: rowWrapperRefsBase,
    stickyScrollRef,
    stickyInnerRef,
    headerHeight,
    sync
  } = useTableScrollSync(prescriptions);
  const rowWrapperRefs = rowWrapperRefsBase as React.MutableRefObject<
    Map<RowWrapperKey, HTMLDivElement>
  >;

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

  const getPlan = (prescription: Prescription) =>
    programmingPlans.find((p) =>
      p.subPlans.some((sp) => sp.id === prescription.programmingSubPlanId)
    ) ?? programmingPlans[0];

  const getSubPlan = (prescription: Prescription) =>
    programmingPlans
      .flatMap((p) => p.subPlans)
      .find((sp) => sp.id === prescription.programmingSubPlanId);

  if (!prescriptions) {
    return null;
  }

  const planOrder = [...new Set(prescriptions.map((p) => p.programmingPlanId))];
  const prescriptionsByPlan = groupBy(prescriptions, 'programmingPlanId');

  // Only count regional prescriptions for currently visible prescriptions
  // (prescriptions may be filtered by matrixQuery / missing filters)
  const visiblePrescriptionIds = new Set(prescriptions.map((p) => p.id));
  const visibleRegionalPrescriptions = regionalPrescriptions.filter((r) =>
    visiblePrescriptionIds.has(r.prescriptionId)
  );

  return (
    <div
      data-testid="prescription-table"
      className="programming-table"
      ref={tableContainerRef}
    >
      <div className="header-wrapper" ref={headerWrapperRef}>
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
            <thead>
              <tr>
                <th scope="col">N°</th>
                <th scope="col" className="border-left">
                  Matrice
                </th>
                <th scope="col" className="border-left">
                  Analyte
                </th>
                <th scope="col" className="border-left border-right">
                  Prélèvements
                  <br />
                  programmés
                </th>
                {RegionList.map((region, regionIdx) => (
                  <th
                    scope="col"
                    className={clsx(
                      { 'border-left': regionIdx !== 0 },
                      cx('fr-p-1w')
                    )}
                    key={`header-${region}`}
                  >
                    <TableHeaderCell
                      shortName={Regions[region].shortName}
                      name={Regions[region].name}
                    />
                  </th>
                ))}
              </tr>
              <tr className="total-row">
                <td colSpan={3} className={cx('fr-text--bold')}>
                  Total prélèvements
                </td>
                <td
                  className={clsx(
                    cx('fr-text--bold'),
                    'border-left',
                    'border-right',
                    'align-center'
                  )}
                >
                  {sumBy(prescriptions, 'sampleCount')}
                </td>
                {RegionList.map((region, regionIdx) => (
                  <td
                    key={`total-${region}`}
                    className={clsx(
                      cx('fr-text--bold'),
                      { 'border-left': regionIdx !== 0 },
                      'align-center'
                    )}
                  >
                    {sumBy(
                      visibleRegionalPrescriptions.filter(
                        (r) => r.region === region
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

              return (
                <Fragment key={`plan-group-${planId}-${context}`}>
                  <div
                    className="plan-group-sticky-container"
                    style={{ top: headerHeight }}
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
                          <Colgroup />
                          <tbody>
                            <tr className="plan-group-header-row plan-group-total-row">
                              <td colSpan={3}>Total prélèvements</td>
                              <td
                                className={clsx(
                                  'border-left',
                                  'border-right',
                                  'align-center'
                                )}
                              >
                                {sumBy(contextPrescriptions, 'sampleCount')}
                              </td>
                              {RegionList.map((region, regionIdx) => (
                                <td
                                  key={region}
                                  className={clsx('align-center', {
                                    'border-left': regionIdx !== 0
                                  })}
                                >
                                  {sumBy(
                                    contextRegionalPrescriptions.filter(
                                      (r) => r.region === region
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
                              <Colgroup />
                              <tbody>
                                <tr>
                                  <td>
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
                                      cx('fr-text--bold'),
                                      'border-left'
                                    )}
                                    data-testid={`matrix-${prescription.id}`}
                                  >
                                    {getPrescriptionTitle(prescription)}
                                  </td>
                                  <td className="border-left">
                                    {subPlan?.substanceKinds
                                      .map((sk) => SubstanceKindLabels[sk])
                                      .join(', ')}
                                  </td>
                                  <td
                                    className={clsx(
                                      'border-left',
                                      'border-right'
                                    )}
                                  >
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
                                      hasPrescriptionPermission(userRole, plan)
                                        .update &&
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
                                          sampleCount={prescription.sampleCount}
                                          distributedCount={totalSampleCount}
                                          small
                                        />
                                      )}
                                    </div>
                                  </td>
                                  {localPrescriptions.map(
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
                                          localPrescription={localPrescription}
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
                                              region: localPrescription.region,
                                              department: undefined,
                                              companySiret: undefined
                                            })
                                          )}
                                          onChange={async (value) =>
                                            onChangeLocalPrescriptionCount(
                                              {
                                                prescriptionId:
                                                  localPrescription.prescriptionId,
                                                region: localPrescription.region
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
