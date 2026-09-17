import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil, sumBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { type Region, RegionList } from 'maestro-shared/referential/Region';
import type { Company } from 'maestro-shared/schema/Company/Company';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
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
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { memo, useState } from 'react';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import LaboratorySelect from 'src/components/LaboratorySelect/LaboratorySelect';
import PrescriptionDistributionBadge from 'src/components/Prescription/PrescriptionDistributionBadge/PrescriptionDistributionBadge';
import SelectionCheckbox from 'src/components/SelectionCheckbox/SelectionCheckbox';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import PrescriptionSubstances from '../../../components/Prescription/PrescriptionSubstances/PrescriptionSubstances';
import {
  bySubstanceKindLabel,
  Colgroup,
  PrescriptionSampleCountInput
} from './ProgrammingPrescriptionTableParts';

interface Props {
  prescription: Prescription;
  plan: ProgrammingPlanChecked;
  subPlan: ProgrammingSubPlan | undefined;
  programmingPlans: ProgrammingPlanChecked[];
  localPrescriptions: LocalPrescription[];
  ownRegionalPrescription: LocalPrescription | undefined;
  rowSubLocalPrescriptions: LocalPrescription[];
  rowCommentCount: number;
  isSelected: boolean;
  isSamplerView: boolean;
  showCheckboxColumn: boolean;
  showLaboratoryColumn: boolean;
  columnCount: number;
  departmentList: Department[];
  companies: Company[];
  region?: Region;
  department?: Department;
  pendingLocalKeys?: Set<LocalPrescriptionKeyString>;
  pendingLaboratoryKeys?: Set<LocalPrescriptionKeyString>;
  pendingPrescriptionIds?: Set<string>;
  onChangeLocalPrescriptionCount: (
    key: LocalPrescriptionKey,
    count: number
  ) => void;
  onChangeLocalPrescriptionLaboratories?: (
    key: LocalPrescriptionKey,
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => void;
  onChangePrescriptionSampleCount?: (
    prescription: Prescription,
    sampleCount: number
  ) => void;
  onTogglePrescriptionSelection?: (prescription: Prescription) => void;
  onOpenComments?: (prescription: Prescription) => void;
  registerRowWrapper: (
    prescriptionId: string,
    el: HTMLDivElement | null
  ) => void;
  onRowScroll: (source: HTMLDivElement) => void;
}

const ProgrammingPrescriptionRow = ({
  prescription,
  plan,
  subPlan,
  programmingPlans,
  localPrescriptions,
  ownRegionalPrescription,
  rowSubLocalPrescriptions,
  rowCommentCount,
  isSelected,
  isSamplerView,
  showCheckboxColumn,
  showLaboratoryColumn,
  columnCount,
  departmentList,
  companies,
  region,
  department,
  pendingLocalKeys,
  pendingLaboratoryKeys,
  pendingPrescriptionIds,
  onChangeLocalPrescriptionCount,
  onChangeLocalPrescriptionLaboratories,
  onChangePrescriptionSampleCount,
  onTogglePrescriptionSelection,
  onOpenComments,
  registerRowWrapper,
  onRowScroll
}: Props) => {
  const { hasUserLocalPrescriptionPermission, hasUserPermission, userRole } =
    useAuthentication();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalSampleCount = sumBy(localPrescriptions, 'sampleCount');
  const showDistributionBadge =
    !isSamplerView &&
    (prescription.sampleCount !== 0 || totalSampleCount !== 0);
  const regionDistributedCount = sumBy(rowSubLocalPrescriptions, 'sampleCount');
  const showRegionDistributionBadge =
    !isSamplerView &&
    plan.distributionKind === 'SLAUGHTERHOUSE' &&
    ((ownRegionalPrescription?.sampleCount ?? 0) !== 0 ||
      regionDistributedCount !== 0);
  const rowHasUnviewedChange = region
    ? hasUnviewedChange(ownRegionalPrescription?.changedAt)
    : localPrescriptions.some((_) => hasUnviewedChange(_.changedAt));
  const rowLocalPrescriptionByRegion = new Map(
    localPrescriptions
      .filter((_) => isNil(_.department))
      .map((_) => [_.region, _] as const)
  );
  const showComments =
    plan.distributionKind === 'REGIONAL' &&
    hasUserPermission('commentPrescription') &&
    !!onOpenComments;
  const showRowLaboratoryCells =
    (plan.distributionKind === 'REGIONAL' ||
      (plan.distributionKind === 'SLAUGHTERHOUSE' && department)) &&
    !!ownRegionalPrescription;
  const rowSubstanceKindsLaboratories: SubstanceKindLaboratory[] = (
    showRowLaboratoryCells
      ? (ownRegionalPrescription?.substanceKindsLaboratories?.length ?? 0) > 0
        ? ((ownRegionalPrescription?.substanceKindsLaboratories ??
            []) as SubstanceKindLaboratory[])
        : (subPlan?.substanceKinds ?? []).map((substanceKind) => ({
            substanceKind,
            laboratoryId: undefined
          }))
      : []
  ).toSorted(bySubstanceKindLabel);
  return (
    <>
      <div
        className={clsx('table-scroll-wrapper', 'prescription-row-wrapper')}
        ref={(el) => registerRowWrapper(prescription.id, el)}
        onScroll={(e) => onRowScroll(e.currentTarget)}
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
                  rowHasUnviewedChange && 'prescription-row--changed'
                )}
              >
                {showCheckboxColumn && (
                  <td className="checkbox-cell">
                    <SelectionCheckbox
                      checked={isSelected}
                      onChange={() =>
                        onTogglePrescriptionSelection?.(prescription)
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
                      title={isExpanded ? 'Réduire' : 'Voir les détails'}
                      onClick={() => setIsExpanded((prev) => !prev)}
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
                  <div className="matrice-cell__content">
                    <span className="matrice-cell__title">
                      {getPrescriptionTitle(prescription)}
                    </span>
                    {showComments && rowCommentCount > 0 && (
                      <Button
                        className="prescription-comments-badge"
                        priority="tertiary no outline"
                        size="small"
                        title={`${rowCommentCount} ${pluralize(rowCommentCount)('commentaire')}`}
                        onClick={() => onOpenComments(prescription)}
                      >
                        <span
                          className={cx('fr-icon-chat-3-line')}
                          aria-hidden="true"
                        />
                        <span className="prescription-comments-badge__count">
                          {rowCommentCount}
                        </span>
                      </Button>
                    )}
                  </div>
                </td>
                <td className={clsx('analyte-cell', 'border-left')}>
                  {showRowLaboratoryCells ? (
                    <div className="analyte-lines">
                      {rowSubstanceKindsLaboratories.map((skl) => (
                        <div key={skl.substanceKind}>
                          {SubstanceKindLabels[skl.substanceKind]}
                        </div>
                      ))}
                    </div>
                  ) : (
                    (subPlan?.substanceKinds ?? [])
                      .map((sk) => SubstanceKindLabels[sk])
                      .toSorted((a, b) => a.localeCompare(b, 'fr'))
                      .join(', ')
                  )}
                </td>
                <td className={clsx('prelevements-cell', 'border-left')}>
                  {region && rowHasUnviewedChange && (
                    <span
                      className={clsx(
                        cx('fr-icon-flashlight-fill', 'fr-icon--sm'),
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
                          localPrescription={ownRegionalPrescription}
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
                        {rowHasUnviewedChange &&
                          !isNil(
                            ownRegionalPrescription.previousSampleCount
                          ) && (
                            <div className="previous-sample-count">
                              Avant :{' '}
                              {ownRegionalPrescription.previousSampleCount}
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
                          <div>{ownRegionalPrescription?.sampleCount ?? 0}</div>
                          {showRegionDistributionBadge && (
                            <PrescriptionDistributionBadge
                              sampleCount={
                                ownRegionalPrescription?.sampleCount ?? 0
                              }
                              distributedCount={regionDistributedCount}
                              small
                            />
                          )}
                        </div>
                        {rowHasUnviewedChange &&
                          !isNil(
                            ownRegionalPrescription?.previousSampleCount
                          ) && (
                            <div className="previous-sample-count">
                              Avant :{' '}
                              {ownRegionalPrescription.previousSampleCount}
                            </div>
                          )}
                      </div>
                    )
                  ) : (
                    (() => {
                      const isNationalEditable =
                        userRole &&
                        hasPrescriptionPermission(userRole, plan).update &&
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
                                value={prescription.sampleCount}
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
                                  sampleCount={prescription.sampleCount}
                                  distributedCount={totalSampleCount}
                                  small
                                />
                              )}
                            </>
                          ) : (
                            <div className="prescription-sample-count-cell__value-row">
                              <div>{prescription.sampleCount}</div>
                              {showDistributionBadge && (
                                <PrescriptionDistributionBadge
                                  sampleCount={prescription.sampleCount}
                                  distributedCount={totalSampleCount}
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
                {showLaboratoryColumn && (
                  <td className={clsx('laboratoire-cell', 'border-right')}>
                    {showRowLaboratoryCells
                      ? (() => {
                          const substanceKindsLaboratories =
                            rowSubstanceKindsLaboratories;
                          const isEditable = hasUserLocalPrescriptionPermission(
                            plan,
                            ownRegionalPrescription
                          )?.updateLaboratories;
                          const isLaboratoryPending =
                            region &&
                            pendingLaboratoryKeys?.has(
                              toLocalPrescriptionKeyString({
                                prescriptionId: prescription.id,
                                region,
                                department,
                                companySiret: undefined
                              })
                            );
                          return substanceKindsLaboratories.map((skl) => (
                            <div className="lab-line" key={skl.substanceKind}>
                              <LaboratorySelect
                                programmingPlanId={plan.id}
                                programmingSubPlanId={
                                  prescription.programmingSubPlanId
                                }
                                substanceKind={skl.substanceKind}
                                laboratoryId={skl.laboratoryId}
                                readonly={!isEditable}
                                pending={isLaboratoryPending}
                                hideLabel
                                onSelect={(laboratoryId) =>
                                  onChangeLocalPrescriptionLaboratories?.(
                                    {
                                      prescriptionId: prescription.id,
                                      region: region as Region,
                                      department
                                    },
                                    substanceKindsLaboratories.map((x) =>
                                      x.substanceKind === skl.substanceKind
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
                          ));
                        })()
                      : null}
                  </td>
                )}
                {!isSamplerView &&
                  (department
                    ? companies.map((company, columnIdx) => {
                        const localPrescription = rowSubLocalPrescriptions.find(
                          (r) => r.companySiret === company.siret
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
                              localPrescription={localPrescription}
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
                                  region: localPrescription.region,
                                  department: localPrescription.department,
                                  companySiret: localPrescription.companySiret
                                })
                              )}
                              onChange={async (value) =>
                                onChangeLocalPrescriptionCount(
                                  {
                                    prescriptionId:
                                      localPrescription.prescriptionId,
                                    region: localPrescription.region,
                                    department: localPrescription.department,
                                    companySiret: localPrescription.companySiret
                                  },
                                  value
                                )
                              }
                            />
                          </td>
                        );
                      })
                    : region
                      ? departmentList.map((departmentColumn, columnIdx) => {
                          const localPrescription =
                            rowSubLocalPrescriptions.find(
                              (r) => r.department === departmentColumn
                            );
                          return (
                            <td
                              className={clsx('align-center', {
                                'border-left': columnIdx !== 0
                              })}
                              data-testid={`cell-${prescription.id}`}
                              key={`cell-${prescription.id}-${departmentColumn}`}
                            >
                              {localPrescription ? (
                                <DistributionCountCell
                                  programmingPlan={plan}
                                  prescription={prescription}
                                  localPrescription={localPrescription}
                                  isEditable={
                                    hasUserLocalPrescriptionPermission(
                                      plan,
                                      localPrescription
                                    )?.distributeToDepartments
                                  }
                                  isPending={pendingLocalKeys?.has(
                                    toLocalPrescriptionKeyString({
                                      prescriptionId:
                                        localPrescription.prescriptionId,
                                      region: localPrescription.region,
                                      department: localPrescription.department,
                                      companySiret: undefined
                                    })
                                  )}
                                  onChange={async (value) =>
                                    onChangeLocalPrescriptionCount(
                                      {
                                        prescriptionId:
                                          localPrescription.prescriptionId,
                                        region: localPrescription.region,
                                        department: localPrescription.department
                                      },
                                      value
                                    )
                                  }
                                />
                              ) : plan.distributionKind !== 'SLAUGHTERHOUSE' ? (
                                'N/A'
                              ) : null}
                            </td>
                          );
                        })
                      : RegionList.map((regionColumn, columnIdx) => {
                          const localPrescription =
                            rowLocalPrescriptionByRegion.get(regionColumn);
                          if (!localPrescription) {
                            return (
                              <td
                                className={clsx('align-center', {
                                  'border-left': columnIdx !== 0
                                })}
                                data-testid={`cell-${prescription.id}`}
                                key={`cell-${prescription.id}-${regionColumn}`}
                              >
                                0
                              </td>
                            );
                          }
                          return (
                            <td
                              className={clsx({
                                'border-left': columnIdx !== 0
                              })}
                              data-testid={`cell-${prescription.id}`}
                              key={`cell-${prescription.id}-${regionColumn}`}
                            >
                              <div className="prescription-sample-count-cell">
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
                                {hasUnviewedChange(
                                  localPrescription.changedAt
                                ) &&
                                  !isNil(
                                    localPrescription.previousSampleCount
                                  ) && (
                                    <div className="previous-sample-count">
                                      Avant :{' '}
                                      {localPrescription.previousSampleCount}
                                    </div>
                                  )}
                              </div>
                            </td>
                          );
                        }))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {isExpanded && (
        <div className="prescription-expanded-content">
          <div className={cx('fr-grid-row')}>
            <div className={cx('fr-col-3')}>
              {showComments && (
                <div className={cx('fr-mb-3w')}>
                  <div className="d-flex-align-center">
                    <span className={cx('fr-icon-chat-3-line', 'fr-pr-1v')} />
                    <b>Commentaires</b>
                  </div>
                  <Button
                    className="prescription-comments-link"
                    priority="tertiary no outline"
                    onClick={() => onOpenComments(prescription)}
                  >
                    {rowCommentCount}{' '}
                    {pluralize(rowCommentCount)('commentaire')}
                  </Button>
                </div>
              )}
              <div className={cx('fr-mb-3w')}>
                <div className="d-flex-align-center">
                  <span className={cx('fr-icon-chat-quote-line', 'fr-pr-1v')} />
                  <b>Notes</b>
                </div>
                {prescription.notes ?? 'Aucune note'}
              </div>
              <div>
                <div className="d-flex-align-center">
                  <span className={cx('fr-icon-chat-quote-line', 'fr-pr-1v')} />
                  <b>Consignes</b>
                </div>
                {prescription.programmingInstruction ?? 'Aucune consigne'}
              </div>
            </div>
            <div className={cx('fr-col-3')}>
              <PrescriptionSubstances
                programmingPlan={
                  programmingPlans.find(
                    (p) => p.id === prescription.programmingPlanId
                  ) ?? programmingPlans[0]
                }
                prescription={prescription}
                renderMode="inline"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ProgrammingPrescriptionRow);
