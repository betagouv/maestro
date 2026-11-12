import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { stageSelectionLabels } from 'maestro-shared/referential/Stage';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementCheckUpdate,
  LaboratoryAgreementSubPlan
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { matrixKindLabel } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import {
  getSubPlanMatrixKinds,
  getSubPlanMatrixLabels
} from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { memo, useMemo } from 'react';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { pluralize } from 'src/utils/stringUtils';

const LABS_DISPLAY_LIMIT = 10;
const MATRIX_DISPLAY_LIMIT = 3;

export type AgreementRow = {
  programmingSubPlan: LaboratoryAgreementSubPlan;
  substanceKinds: SubstanceKind[];
  laboratories: LaboratoryAgreement[];
};

export const substanceKindsLabel = (
  row: Pick<AgreementRow, 'substanceKinds'>
): string =>
  row.substanceKinds
    .map((substanceKind) => SubstanceKindLabels[substanceKind])
    .join(', ');

export const isRowChecked = (
  checksSet: Set<string>,
  row: Pick<AgreementRow, 'programmingSubPlan' | 'substanceKinds'>
): boolean =>
  row.substanceKinds.every((substanceKind) =>
    checksSet.has(`${row.programmingSubPlan.id}_${substanceKind}`)
  );

interface Props {
  row: AgreementRow;
  rowKey: string;
  isSelected: boolean;
  isExpanded: boolean;
  isChecked: boolean;
  isPending: boolean;
  isAnimating: boolean;
  isLabsExpanded: boolean;
  isMatrixExpanded: boolean;
  canEdit: boolean;
  laboratoriesById: Map<string, Laboratory>;
  domainLabels: Map<ProgrammingPlanDomainId, string>;
  onToggleSelect: (key: string) => void;
  onToggleExpand: (key: string) => void;
  onToggleLabs: (key: string) => void;
  onToggleMatrix: (key: string) => void;
  onOpenModalForRow: (row: AgreementRow) => void;
  onUpdateCheck: (params: LaboratoryAgreementCheckUpdate) => void;
  onPendingStart: (key: string) => void;
  onPendingEnd: (key: string) => void;
  onAnimatingStart: (key: string) => void;
  onAnimatingEnd: (key: string) => void;
}

const AgreementTableRow = memo(function AgreementTableRow({
  row,
  rowKey,
  isSelected,
  isExpanded,
  isChecked,
  isPending,
  isAnimating,
  isLabsExpanded,
  isMatrixExpanded,
  canEdit,
  laboratoriesById,
  domainLabels,
  onToggleSelect,
  onToggleExpand,
  onToggleLabs,
  onToggleMatrix,
  onOpenModalForRow,
  onUpdateCheck,
  onPendingStart,
  onPendingEnd,
  onAnimatingStart,
  onAnimatingEnd
}: Props) {
  const matrixReferential = useMatrixReferential();
  const allMatrices = useMemo(
    () =>
      getSubPlanMatrixLabels(
        matrixReferential,
        row.programmingSubPlan.matrices
      ),
    [matrixReferential, row.programmingSubPlan]
  );
  const visibleMatrices = isMatrixExpanded
    ? allMatrices
    : allMatrices.slice(0, MATRIX_DISPLAY_LIMIT);
  const remainingMatrices = allMatrices.length - MATRIX_DISPLAY_LIMIT;

  const allLabs = useMemo(
    () =>
      row.laboratories
        .filter(
          (l) =>
            l.referenceLaboratory ||
            l.detectionAnalysis ||
            l.confirmationAnalysis
        )
        .toSorted((a, b) =>
          (laboratoriesById.get(a.laboratoryId)?.shortName ?? '').localeCompare(
            laboratoriesById.get(b.laboratoryId)?.shortName ?? ''
          )
        ),
    [row.laboratories, laboratoriesById]
  );
  const visibleLabs = isLabsExpanded
    ? allLabs
    : allLabs.slice(0, LABS_DISPLAY_LIMIT);
  const remainingLabs = allLabs.length - LABS_DISPLAY_LIMIT;

  const subPlanDetails = useMemo(() => {
    if (!isExpanded) {
      return [];
    }

    const subPlan = row.programmingSubPlan;
    const stages = stageSelectionLabels(subPlan.stages);
    const matrixKinds = getSubPlanMatrixKinds(subPlan.matrices).map((kind) =>
      matrixKindLabel(matrixReferential, kind)
    );

    return [
      {
        label: 'Domaine',
        value: domainLabels.get(subPlan.programmingPlanDomainId)
      },
      { label: 'Plan', value: subPlan.programmingPlanTitle },
      {
        label: `${pluralize(stages.length)('Stade')} de prélèvement`,
        value: stages.length > 0 ? stages.join(', ') : undefined
      },
      {
        label: 'Espèce/produit',
        value: matrixKinds.length > 0 ? matrixKinds.join(', ') : undefined
      },
      {
        label: 'Délégation',
        value: isNil(subPlan.delegated)
          ? undefined
          : subPlan.delegated
            ? 'Délégué'
            : 'Non délégué'
      },
      {
        label: 'Nature du plan',
        value: subPlan.context ? ContextLabels[subPlan.context] : undefined
      }
    ].filter(({ value }) => !isNil(value));
  }, [row.programmingSubPlan, isExpanded, domainLabels, matrixReferential]);

  const handleCheck = () => {
    if (isPending) return;
    if (!isChecked) {
      onPendingStart(rowKey);
      setTimeout(() => onAnimatingStart(rowKey), 700);
      setTimeout(() => {
        for (const substanceKind of row.substanceKinds) {
          onUpdateCheck({
            programmingSubPlanId: row.programmingSubPlan.id,
            substanceKind,
            checked: true
          });
        }
        onPendingEnd(rowKey);
        onAnimatingEnd(rowKey);
      }, 1000);
    } else {
      for (const substanceKind of row.substanceKinds) {
        onUpdateCheck({
          programmingSubPlanId: row.programmingSubPlan.id,
          substanceKind,
          checked: false
        });
      }
    }
  };

  return (
    <>
      <tr className={clsx({ 'row-animating-out': isAnimating })}>
        {canEdit && (
          <td
            rowSpan={isExpanded ? 2 : 1}
            className="selectable-cell col-select"
          >
            <Checkbox
              options={[
                {
                  label: '',
                  nativeInputProps: {
                    checked: isSelected,
                    onChange: () => onToggleSelect(rowKey)
                  }
                }
              ]}
              small
              className={cx('fr-pb-3w')}
            />
          </td>
        )}

        <td className="col-number">
          <div className={clsx('border-left', 'row-reference')}>
            {row.programmingSubPlan.subPlanNumber}
            <Button
              iconId={
                isExpanded
                  ? 'fr-icon-arrow-up-s-line'
                  : 'fr-icon-arrow-down-s-line'
              }
              priority="tertiary no outline"
              size="small"
              title="Voir le type de plan"
              onClick={() => onToggleExpand(rowKey)}
            />
          </div>
        </td>

        <td className="col-substances">
          <div className="border-left">{substanceKindsLabel(row)}</div>
        </td>

        <td className="col-matrix">
          <div className="border-left">
            {visibleMatrices.map((title, i) => (
              <div key={i}>{title}</div>
            ))}
            {!isMatrixExpanded && remainingMatrices > 0 && (
              <Button
                priority="tertiary"
                onClick={() => onToggleMatrix(rowKey)}
                iconId="fr-icon-add-line"
                size="small"
              >
                Voir{' '}
                {pluralize(remainingMatrices, { preserveCount: true })(
                  'supplémentaire'
                )}
              </Button>
            )}
            {isMatrixExpanded && (
              <Button
                priority="tertiary"
                onClick={() => onToggleMatrix(rowKey)}
                iconId="fr-icon-subtract-line"
                size="small"
              >
                Voir moins
              </Button>
            )}
          </div>
        </td>

        <td className="col-labs">
          <div
            className="border-left"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              alignItems: 'center'
            }}
          >
            {visibleLabs.map((lab) => {
              const laboratory = laboratoriesById.get(lab.laboratoryId);
              if (!laboratory) return null;
              return (
                <LaboratoryAgreementTag
                  key={lab.laboratoryId}
                  laboratoryAgreement={lab}
                  programmingSubPlan={row.programmingSubPlan}
                  laboratory={laboratory}
                  disabled={!canEdit}
                />
              );
            })}
            {!isLabsExpanded && remainingLabs > 0 && (
              <Button
                priority="tertiary"
                onClick={() => onToggleLabs(rowKey)}
                iconId="fr-icon-add-line"
                size="small"
              >
                Voir{' '}
                {pluralize(remainingLabs, { preserveCount: true })(
                  'supplémentaire'
                )}
              </Button>
            )}
            {isLabsExpanded && (
              <Button
                priority="tertiary"
                onClick={() => onToggleLabs(rowKey)}
                iconId="fr-icon-subtract-line"
                size="small"
              >
                Voir moins
              </Button>
            )}
          </div>
        </td>

        {canEdit && (
          <td className="col-actions" colSpan={isChecked ? 2 : 1}>
            <div className="float-right">
              <Button
                iconId={
                  row.laboratories.length === 0
                    ? 'fr-icon-add-line'
                    : 'fr-icon-edit-line'
                }
                priority="tertiary"
                size="medium"
                title={
                  row.laboratories.length === 0
                    ? 'Affecter des laboratoires'
                    : 'Modifier les laboratoires'
                }
                onClick={() => onOpenModalForRow(row)}
              />
            </div>
          </td>
        )}

        {canEdit && !isChecked && (
          <td className="col-check">
            <div className="check-cell row-unchecked">
              <RadioButtons
                legend="Ligne vérifiée"
                classes={{ legend: 'fr-sr-only' }}
                options={[
                  {
                    label: '',
                    nativeInputProps: {
                      checked: isPending,
                      title: 'Marquer comme vérifié',
                      onChange: handleCheck
                    }
                  }
                ]}
              />
            </div>
          </td>
        )}
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={canEdit ? 6 : 4}>
            <div className="sub-row-content border-left">
              <div className="sub-row-details">
                {subPlanDetails.map(({ label, value }) => (
                  <span key={label}>
                    {label} : <strong>{value}</strong>
                  </span>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

export default AgreementTableRow;
