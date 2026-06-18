import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import clsx from 'clsx';
import { StageLabels } from 'maestro-shared/referential/Stage';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementCheckUpdate
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { memo, useMemo } from 'react';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import { pluralize } from 'src/utils/stringUtils';

const LABS_DISPLAY_LIMIT = 10;
const MATRIX_DISPLAY_LIMIT = 3;

export type AgreementRow = {
  programmingSubPlan: ProgrammingSubPlan;
  programmingPlanYear: number;
  substanceKind: SubstanceKind;
  laboratories: LaboratoryAgreement[];
};

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
  prescriptions: Prescription[];
  laboratoriesById: Map<string, Laboratory>;
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
  prescriptions,
  laboratoriesById,
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
  const allMatrices = useMemo(
    () => prescriptions.map(getPrescriptionTitle),
    [prescriptions]
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

  const planStages = useMemo(
    () =>
      isExpanded ? [...new Set(prescriptions.flatMap((p) => p.stages))] : [],
    [prescriptions, isExpanded]
  );

  const handleCheck = () => {
    if (isPending) return;
    if (!isChecked) {
      onPendingStart(rowKey);
      setTimeout(() => onAnimatingStart(rowKey), 700);
      setTimeout(() => {
        onUpdateCheck({
          programmingSubPlanId: row.programmingSubPlan.id,
          substanceKind: row.substanceKind,
          checked: true
        });
        onPendingEnd(rowKey);
        onAnimatingEnd(rowKey);
      }, 1000);
    } else {
      onUpdateCheck({
        programmingSubPlanId: row.programmingSubPlan.id,
        substanceKind: row.substanceKind,
        checked: false
      });
    }
  };

  return (
    <>
      <tr className={clsx({ 'row-animating-out': isAnimating })}>
        <td rowSpan={isExpanded ? 2 : 1} className="selectable-cell">
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

        <td>
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

        <td>
          <div className="border-left">
            {SubstanceKindLabels[row.substanceKind]}
          </div>
        </td>

        <td>
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

        <td>
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

        <td colSpan={isChecked ? 2 : 1}>
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

        {!isChecked && (
          <td>
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
          <td colSpan={6}>
            <div className="sub-row-content border-left">
              <div
                style={{
                  display: 'flex',
                  gap: '2rem',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <div>
                  Type de plan : <strong>{row.programmingSubPlan.label}</strong>
                </div>
                {planStages.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span>
                      {pluralize(planStages.length)('Stade')} de prélèvement :{' '}
                      <strong>
                        {planStages.map((s) => StageLabels[s]).join(', ')}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

export default AgreementTableRow;
