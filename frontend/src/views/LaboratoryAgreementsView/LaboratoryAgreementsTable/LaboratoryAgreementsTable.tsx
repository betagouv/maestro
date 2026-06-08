import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Notice from '@codegouvfr/react-dsfr/Notice';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import type { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { StageLabels } from 'maestro-shared/referential/Stage';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementCheckUpdate,
  LaboratoryAgreementField,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import {
  type ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindReference
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useLayoutEffect, useRef, useState } from 'react';
import ColumnFilterHeader from 'src/components/ColumnFilterHeader/ColumnFilterHeader';
import LaboratoryAgreementButtons from 'src/components/LaboratoryAgreement/LaboratoryAgreementButtons/LaboratoryAgreementButtons';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import { pluralize } from 'src/utils/stringUtils';

const LABS_DISPLAY_LIMIT = 6;
const MATRIX_DISPLAY_LIMIT = 3;

export type AgreementRow = {
  programmingPlanId: string;
  programmingPlanKind: ProgrammingPlanKind;
  programmingPlanYear: number;
  substanceKind: SubstanceKind;
  laboratories: LaboratoryAgreement[];
};

export const toRowKey = (
  row: Pick<
    AgreementRow,
    'programmingPlanId' | 'programmingPlanKind' | 'substanceKind'
  >
) => `${row.programmingPlanId}_${row.programmingPlanKind}_${row.substanceKind}`;

interface Props {
  rows: AgreementRow[];
  selectedStringRowKeys: string[];
  allSelected: boolean;
  selectedRowsConsistent: boolean;
  checks: LaboratoryAgreementRowKey[];
  laboratories: Laboratory[];
  allPrescriptions: Prescription[];
  kindFilter: ProgrammingPlanKind[];
  kindOptions: { value: ProgrammingPlanKind; label: string }[];
  onKindFilterChange: (values: ProgrammingPlanKind[]) => void;
  substanceFilter: SubstanceKind[];
  substanceOptions: { value: SubstanceKind; label: string }[];
  onSubstanceFilterChange: (values: SubstanceKind[]) => void;
  matrixFilter: MatrixKind[];
  matrixOptions: { value: MatrixKind; label: string }[];
  onMatrixFilterChange: (values: MatrixKind[]) => void;
  labFilter: string[];
  labOptions: { value: string; label: string; disabled: boolean }[];
  onLabFilterChange: (values: string[]) => void;
  labAgreementTypeFilter: LaboratoryAgreementField[];
  onLabAgreementTypeFilterChange: (values: LaboratoryAgreementField[]) => void;
  onToggleRow: (key: string) => void;
  onToggleAll: () => void;
  onDeselect: () => void;
  onOpenModal: () => void;
  onOpenModalForRow: (row: AgreementRow) => void;
  onUpdateCheck: (params: LaboratoryAgreementCheckUpdate) => void;
}

const LaboratoryAgreementsTable = ({
  rows,
  selectedStringRowKeys,
  allSelected,
  selectedRowsConsistent,
  checks,
  laboratories,
  allPrescriptions,
  kindFilter,
  kindOptions,
  onKindFilterChange,
  substanceFilter,
  substanceOptions,
  onSubstanceFilterChange,
  matrixFilter,
  matrixOptions,
  onMatrixFilterChange,
  labFilter,
  labOptions,
  onLabFilterChange,
  labAgreementTypeFilter,
  onLabAgreementTypeFilterChange,
  onToggleRow,
  onToggleAll,
  onDeselect,
  onOpenModal,
  onOpenModalForRow,
  onUpdateCheck
}: Props) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [expandedLabRowKeys, setExpandedLabRowKeys] = useState<string[]>([]);
  const [expandedMatrixRowKeys, setExpandedMatrixRowKeys] = useState<string[]>(
    []
  );
  const [expandedStageRowKeys, setExpandedStageRowKeys] = useState<string[]>(
    []
  );
  const [animatingRowKeys, setAnimatingRowKeys] = useState<string[]>([]);
  const [pendingCheckRowKeys, setPendingCheckRowKeys] = useState<string[]>([]);

  const noticeRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const isRowChecked = (row: AgreementRow) =>
    checks.some(
      (c) =>
        c.programmingPlanId === row.programmingPlanId &&
        c.programmingPlanKind === row.programmingPlanKind &&
        c.substanceKind === row.substanceKind
    );

  const toggleExpand = (key: string) =>
    setExpandedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleLabsExpand = (key: string) =>
    setExpandedLabRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleMatrixExpand = (key: string) =>
    setExpandedMatrixRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleStageExpand = (key: string) =>
    setExpandedStageRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  useLayoutEffect(() => {
    const el = noticeRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(() => {
      el.parentElement
        ?.querySelector('.laboratory-agreements-table-wrapper')
        ?.setAttribute('style', `--notice-height: ${el.offsetHeight}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedStringRowKeys]);

  // Gestion des lignes pliées / dépliées du tableau.
  // Le composant Table ne gère pas nativement les cellules avec rowspan ou colspan, on doit donc manipuler le DOM après coup.
  // On utilise useLayoutEffect pour éviter les clignotements ou les rendus intermédiaires incorrects.
  useLayoutEffect(() => {
    const table = tableContainerRef.current?.querySelector('table');
    if (!table) {
      return;
    }

    const domRows = Array.from(table.querySelectorAll('tbody tr'));

    const colgroup =
      table.querySelector('colgroup') ??
      table.insertBefore(document.createElement('colgroup'), table.firstChild);
    colgroup.innerHTML = [
      '<col style="width:3rem">',
      '<col style="width:6rem">',
      '<col style="width:12rem">',
      '<col style="width:16rem">',
      '<col>',
      '<col style="width:4rem">',
      '<col style="width:4rem">'
    ].join('');

    domRows.forEach((tr) => {
      const tds = Array.from(tr.querySelectorAll('td')) as HTMLElement[];
      tds.forEach((td) => {
        td.removeAttribute('rowspan');
        td.removeAttribute('colspan');
        td.style.display = '';
      });
    });

    const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[];
    ths.forEach((th, i) => {
      th.setAttribute('colspan', i === 4 ? '3' : '1');
    });

    domRows.forEach((tr) => {
      const tds = Array.from(tr.querySelectorAll('td')) as HTMLElement[];
      const checkTd = tds[6];
      if (checkTd?.querySelector('.row-checked')) {
        if (tds[5]) {
          tds[5].setAttribute('colspan', '2');
        }
        checkTd.style.display = 'none';
      }
    });

    domRows.forEach((tr, i) => {
      const firstTd = tr.querySelector('td:first-child') as HTMLElement | null;
      if (!firstTd?.querySelector('.row-expanded')) {
        return;
      }
      firstTd.setAttribute('rowspan', '2');
      const nextRow = domRows[i + 1];
      if (!nextRow) {
        return;
      }
      const nextTds = Array.from(
        nextRow.querySelectorAll('td')
      ) as HTMLElement[];
      nextTds[0].style.display = 'none';
      nextTds[1].setAttribute('colspan', '5');
    });
  }, [expandedRowKeys, rows, checks]);

  useLayoutEffect(() => {
    const table = tableContainerRef.current?.querySelector('table');
    if (!table) {
      return;
    }
    Array.from(table.querySelectorAll('tbody tr')).forEach((tr) => {
      const keyEl = tr.querySelector<HTMLElement>('[data-row-key]');
      const rowKey = keyEl?.dataset.rowKey;
      tr.classList.toggle(
        'row-animating-out',
        !!rowKey && animatingRowKeys.includes(rowKey)
      );
    });
  }, [animatingRowKeys, pendingCheckRowKeys]);

  return (
    <>
      <div ref={noticeRef} className="laboratory-agreements-notice-container">
        {selectedStringRowKeys.length > 0 && (
          <div
            className={clsx(
              cx('fr-px-3w', 'fr-py-2w'),
              'laboratory-agreements-notice'
            )}
          >
            <div className="d-flex-justify-between d-flex-align-center">
              <span className={clsx(cx('fr-text--bold'), 'no-wrap')}>
                {pluralize(selectedStringRowKeys.length, {
                  preserveCount: true
                })('plan sélectionné')}
              </span>
              {!selectedRowsConsistent && (
                <Notice
                  className={cx('fr-m-0', 'fr-p-0')}
                  title=""
                  description="Les sous-plans sélectionnés ont des laboratoires affectés différents. L'action groupée n'est pas possible."
                  severity="info"
                  isClosable={false}
                />
              )}
              <span className="d-flex-align-center no-wrap">
                <Button
                  priority="tertiary no outline"
                  size="small"
                  onClick={onDeselect}
                  className="link-underline"
                >
                  Déselectionner tout
                </Button>
                <Button
                  iconId="fr-icon-microscope-line"
                  priority="secondary"
                  size="small"
                  onClick={onOpenModal}
                  disabled={!selectedRowsConsistent}
                  className={cx('fr-ml-3w')}
                >
                  Affecter les laboratoires
                </Button>
              </span>
            </div>
          </div>
        )}
      </div>
      <div
        ref={tableContainerRef}
        className="laboratory-agreements-table-wrapper laboratory-agreements-table"
      >
        <Table
          noCaption
          bordered
          className={cx('fr-pt-0')}
          headers={[
            <div
              key="select-all"
              className={clsx(cx('fr-checkbox-group'), 'selectable-cell')}
            >
              <Checkbox
                options={[
                  {
                    label: '',
                    nativeInputProps: {
                      checked: allSelected,
                      onChange: onToggleAll
                    }
                  }
                ]}
                small
                className={cx('fr-pb-3w')}
              />
            </div>,
            <div key="header-reference" className="border-left">
              <ColumnFilterHeader
                label="ID"
                options={kindOptions}
                selectedValues={kindFilter}
                onChange={onKindFilterChange}
              />
            </div>,
            <div key="header-substance" className="border-left">
              <ColumnFilterHeader
                label="Analytes"
                options={substanceOptions}
                selectedValues={substanceFilter}
                onChange={onSubstanceFilterChange}
              />
            </div>,
            <div key="header-matrix" className="border-left">
              <ColumnFilterHeader
                label="Matrices"
                options={matrixOptions}
                selectedValues={matrixFilter}
                onChange={onMatrixFilterChange}
              />
            </div>,
            <div key="header-labs" className="border-left">
              <ColumnFilterHeader
                label="Laboratoires agréés"
                options={labOptions}
                selectedValues={labFilter}
                onChange={onLabFilterChange}
                onReset={() => onLabAgreementTypeFilterChange([])}
                menuAlign="right"
                extraActive={labAgreementTypeFilter.length > 0}
                extraContent={
                  <div className={clsx('d-flex-align-center')}>
                    <span className={cx('fr-mr-16w')}>
                      Filtrer par type d'agrément
                    </span>
                    <LaboratoryAgreementButtons
                      values={{
                        referenceLaboratory: labAgreementTypeFilter.includes(
                          'referenceLaboratory'
                        ),
                        detectionAnalysis:
                          labAgreementTypeFilter.includes('detectionAnalysis'),
                        confirmationAnalysis: labAgreementTypeFilter.includes(
                          'confirmationAnalysis'
                        )
                      }}
                      onToggle={(field) =>
                        onLabAgreementTypeFilterChange(
                          labAgreementTypeFilter.includes(field)
                            ? labAgreementTypeFilter.filter((f) => f !== field)
                            : [...labAgreementTypeFilter, field]
                        )
                      }
                    />
                  </div>
                }
              />
            </div>
          ]}
          data={rows.flatMap((row) => {
            const rowKey = toRowKey(row);
            const isExpanded = expandedRowKeys.includes(rowKey);

            const mainRow = [
              <div
                key={`select-${rowKey}`}
                data-row-key={rowKey}
                className={clsx('selectable-cell', {
                  'row-expanded': isExpanded
                })}
              >
                <Checkbox
                  options={[
                    {
                      label: '',
                      nativeInputProps: {
                        checked: selectedStringRowKeys.includes(rowKey),
                        onChange: () => onToggleRow(rowKey)
                      }
                    }
                  ]}
                  small
                  className={cx('fr-pb-3w')}
                />
              </div>,
              <div
                key={`reference-${rowKey}`}
                className={clsx('border-left', 'row-reference')}
              >
                {ProgrammingPlanKindReference[row.programmingPlanKind]}
                <Button
                  iconId={
                    isExpanded
                      ? 'fr-icon-arrow-up-s-line'
                      : 'fr-icon-arrow-down-s-line'
                  }
                  priority="tertiary no outline"
                  size="small"
                  title="Voir le type de plan"
                  onClick={() => toggleExpand(rowKey)}
                />
              </div>,
              <div key={`substance-${rowKey}`} className="border-left">
                {SubstanceKindLabels[row.substanceKind]}
              </div>,
              <div key={`matrix-${rowKey}`} className="border-left">
                {(() => {
                  const allMatrices = allPrescriptions
                    .filter(
                      (p) =>
                        p.programmingPlanId === row.programmingPlanId &&
                        p.programmingPlanKind === row.programmingPlanKind
                    )
                    .map(getPrescriptionTitle);
                  const isMatrixExpanded =
                    expandedMatrixRowKeys.includes(rowKey);
                  const visibleMatrices = isMatrixExpanded
                    ? allMatrices
                    : allMatrices.slice(0, MATRIX_DISPLAY_LIMIT);
                  const remaining = allMatrices.length - MATRIX_DISPLAY_LIMIT;
                  return (
                    <>
                      {visibleMatrices.map((title, i) => (
                        <div key={i}>{title}</div>
                      ))}
                      {!isMatrixExpanded && remaining > 0 && (
                        <Button
                          priority="tertiary"
                          onClick={() => toggleMatrixExpand(rowKey)}
                          iconId="fr-icon-add-line"
                          size="small"
                        >
                          Voir{' '}
                          {pluralize(remaining, { preserveCount: true })(
                            'supplémentaire'
                          )}
                        </Button>
                      )}
                      {isMatrixExpanded && (
                        <Button
                          priority="tertiary"
                          onClick={() => toggleMatrixExpand(rowKey)}
                          iconId="fr-icon-subtract-line"
                          size="small"
                        >
                          Voir moins
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>,
              <div
                key={`labs-${rowKey}`}
                className="border-left"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.25rem',
                  alignItems: 'center'
                }}
              >
                {(() => {
                  const allLabs = row.laboratories
                    .filter(
                      (lab) =>
                        lab.referenceLaboratory ||
                        lab.detectionAnalysis ||
                        lab.confirmationAnalysis
                    )
                    .toSorted((a, b) => {
                      const shortNameA =
                        laboratories.find((l) => l.id === a.laboratoryId)
                          ?.shortName ?? '';
                      const shortNameB =
                        laboratories.find((l) => l.id === b.laboratoryId)
                          ?.shortName ?? '';
                      return shortNameA.localeCompare(shortNameB);
                    });
                  const isLabsExpanded = expandedLabRowKeys.includes(rowKey);
                  const visibleLabs = isLabsExpanded
                    ? allLabs
                    : allLabs.slice(0, LABS_DISPLAY_LIMIT);
                  const remaining = allLabs.length - LABS_DISPLAY_LIMIT;
                  return (
                    <>
                      {visibleLabs.map((lab) => {
                        const laboratory = laboratories.find(
                          (l) => l.id === lab.laboratoryId
                        );
                        if (!laboratory) {
                          return null;
                        }
                        return (
                          <LaboratoryAgreementTag
                            key={lab.laboratoryId}
                            laboratoryAgreement={lab}
                            laboratory={laboratory}
                          />
                        );
                      })}
                      {!isLabsExpanded && remaining > 0 && (
                        <Button
                          priority="tertiary"
                          onClick={() => toggleLabsExpand(rowKey)}
                          iconId="fr-icon-add-line"
                          size="small"
                        >
                          Voir{' '}
                          {pluralize(remaining, {
                            preserveCount: true
                          })('supplémentaire')}
                        </Button>
                      )}
                      {isLabsExpanded && (
                        <Button
                          priority="tertiary"
                          onClick={() => toggleLabsExpand(rowKey)}
                          iconId="fr-icon-subtract-line"
                          size="small"
                        >
                          Voir moins
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>,
              <div key={`action-${rowKey}`} className="float-right">
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
              </div>,
              <div
                key={`check-${rowKey}`}
                className={clsx('check-cell', {
                  'row-unchecked': !isRowChecked(row),
                  'row-checked': isRowChecked(row)
                })}
              >
                <RadioButtons
                  legend="Ligne vérifiée"
                  classes={{ legend: 'fr-sr-only' }}
                  options={[
                    {
                      label: '',
                      nativeInputProps: {
                        checked:
                          isRowChecked(row) ||
                          pendingCheckRowKeys.includes(rowKey),
                        title: isRowChecked(row)
                          ? 'Marquer comme non vérifié'
                          : 'Marquer comme vérifié',
                        onChange: () => {
                          if (pendingCheckRowKeys.includes(rowKey)) {
                            return;
                          }
                          const willCheck = !isRowChecked(row);
                          if (willCheck) {
                            setPendingCheckRowKeys((prev) => [...prev, rowKey]);
                            setTimeout(() => {
                              setAnimatingRowKeys((prev) => [...prev, rowKey]);
                            }, 700);
                            setTimeout(() => {
                              onUpdateCheck({
                                programmingPlanId: row.programmingPlanId,
                                programmingPlanKind: row.programmingPlanKind,
                                substanceKind: row.substanceKind,
                                checked: true
                              });
                              setPendingCheckRowKeys((prev) =>
                                prev.filter((k) => k !== rowKey)
                              );
                              setAnimatingRowKeys((prev) =>
                                prev.filter((k) => k !== rowKey)
                              );
                            }, 1000);
                          } else {
                            onUpdateCheck({
                              programmingPlanId: row.programmingPlanId,
                              programmingPlanKind: row.programmingPlanKind,
                              substanceKind: row.substanceKind,
                              checked: false
                            });
                          }
                        }
                      }
                    }
                  ]}
                />
              </div>
            ];

            if (!isExpanded) {
              return [mainRow];
            }

            const planStages = [
              ...new Set(
                allPrescriptions
                  .filter(
                    (p) =>
                      p.programmingPlanId === row.programmingPlanId &&
                      p.programmingPlanKind === row.programmingPlanKind
                  )
                  .flatMap((p) => p.stages)
              )
            ];
            const isStageExpanded = expandedStageRowKeys.includes(rowKey);
            const visibleStages = isStageExpanded
              ? planStages
              : planStages.slice(0, 1);
            const remainingStages = planStages.length - 1;

            const subRow = [
              <span key={`sub-start-${rowKey}`} />,
              <div
                key={`sub-kind-${rowKey}`}
                className="sub-row-content border-left"
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    Type de plan :{' '}
                    <strong>
                      {ProgrammingPlanKindLabels[row.programmingPlanKind]}
                    </strong>
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
                        Stade de prélèvement :{' '}
                        <strong>
                          {visibleStages.map((s) => StageLabels[s]).join(', ')}
                        </strong>
                      </span>
                      {!isStageExpanded && remainingStages > 0 && (
                        <Button
                          priority="tertiary"
                          onClick={() => toggleStageExpand(rowKey)}
                          size="small"
                          iconId="fr-icon-add-line"
                        >
                          Voir{' '}
                          {pluralize(remainingStages, {
                            preserveCount: true
                          })('supplémentaire')}
                        </Button>
                      )}
                      {isStageExpanded && (
                        <Button
                          priority="tertiary"
                          onClick={() => toggleStageExpand(rowKey)}
                          size="small"
                          iconId="fr-icon-subtract-line"
                        >
                          Voir moins
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>,
              <span key={`sub-check-${rowKey}`} />
            ];

            return [mainRow, subRow];
          })}
        />
      </div>
    </>
  );
};

export default LaboratoryAgreementsTable;
