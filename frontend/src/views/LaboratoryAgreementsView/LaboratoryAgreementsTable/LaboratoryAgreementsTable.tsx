import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Notice from '@codegouvfr/react-dsfr/Notice';
import clsx from 'clsx';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  LaboratoryAgreementCheckUpdate,
  LaboratoryAgreementField,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ColumnFilterHeader from 'src/components/ColumnFilterHeader/ColumnFilterHeader';
import LaboratoryAgreementButtons from 'src/components/LaboratoryAgreement/LaboratoryAgreementButtons/LaboratoryAgreementButtons';
import { pluralize } from 'src/utils/stringUtils';
import type { AgreementRow } from './AgreementTableRow';
import AgreementTableRow from './AgreementTableRow';

export type { AgreementRow };

export const toRowKey = (
  row: Pick<AgreementRow, 'programmingSubPlan' | 'substanceKind'>
) => `${row.programmingSubPlan.id}_${row.substanceKind}`;

const ROW_HEIGHT = 100;
const OVERSCAN = 10;

interface Props {
  rows: AgreementRow[];
  selectedStringRowKeys: string[];
  allSelected: boolean;
  selectedRowsConsistent: boolean;
  checks: LaboratoryAgreementRowKey[];
  laboratories: Laboratory[];
  allPrescriptions: Prescription[];
  kindFilter: ProgrammingSubPlanId[];
  kindOptions: { value: ProgrammingSubPlanId; label: string }[];
  onKindFilterChange: (values: ProgrammingSubPlanId[]) => void;
  substanceFilter: SubstanceKind[];
  substanceOptions: { value: SubstanceKind; label: string }[];
  onSubstanceFilterChange: (values: SubstanceKind[]) => void;
  matrixCombinedFilter: string[];
  matrixCombinedOptions: { value: string; label: string }[];
  onMatrixCombinedFilterChange: (values: string[]) => void;
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
const LaboratoryAgreementsTable = memo(function LaboratoryAgreementsTable({
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
  matrixCombinedFilter,
  matrixCombinedOptions,
  onMatrixCombinedFilterChange,
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
}: Props) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [expandedLabRowKeys, setExpandedLabRowKeys] = useState<string[]>([]);
  const [expandedMatrixRowKeys, setExpandedMatrixRowKeys] = useState<string[]>(
    []
  );
  const [animatingRowKeys, setAnimatingRowKeys] = useState<string[]>([]);
  const [pendingCheckRowKeys, setPendingCheckRowKeys] = useState<string[]>([]);

  const noticeRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableTopRef = useRef(0);

  useLayoutEffect(() => {
    const el = noticeRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      el.parentElement
        ?.querySelector('.laboratory-agreements-table-wrapper')
        ?.setAttribute('style', `--notice-height: ${el.offsetHeight}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedStringRowKeys]);

  const [scrollTop, setScrollTop] = useState(
    typeof window !== 'undefined' ? window.scrollY : 0
  );

  useEffect(() => {
    let rafId: number;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (tableContainerRef.current) {
          tableTopRef.current =
            tableContainerRef.current.getBoundingClientRect().top +
            window.scrollY;
        }
        setScrollTop(window.scrollY);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const checksSet = useMemo(
    () =>
      new Set(
        checks.map((c) => `${c.programmingSubPlanId}_${c.substanceKind}`)
      ),
    [checks]
  );

  const prescriptionsBySubPlanId = useMemo(() => {
    const map = new Map<string, Prescription[]>();
    for (const p of allPrescriptions) {
      const arr = map.get(p.programmingSubPlanId) ?? [];
      arr.push(p);
      map.set(p.programmingSubPlanId, arr);
    }
    return map;
  }, [allPrescriptions]);

  const laboratoriesById = useMemo(
    () => new Map(laboratories.map((l) => [l.id, l])),
    [laboratories]
  );

  const handleToggleExpand = useCallback(
    (key: string) =>
      setExpandedRowKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      ),
    []
  );
  const handleToggleLabs = useCallback(
    (key: string) =>
      setExpandedLabRowKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      ),
    []
  );
  const handleToggleMatrix = useCallback(
    (key: string) =>
      setExpandedMatrixRowKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      ),
    []
  );
  const handlePendingStart = useCallback(
    (key: string) => setPendingCheckRowKeys((prev) => [...prev, key]),
    []
  );
  const handlePendingEnd = useCallback(
    (key: string) =>
      setPendingCheckRowKeys((prev) => prev.filter((k) => k !== key)),
    []
  );
  const handleAnimatingStart = useCallback(
    (key: string) => setAnimatingRowKeys((prev) => [...prev, key]),
    []
  );
  const handleAnimatingEnd = useCallback(
    (key: string) =>
      setAnimatingRowKeys((prev) => prev.filter((k) => k !== key)),
    []
  );

  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 600;
  const relativeTop = scrollTop - tableTopRef.current;
  const startIndex = Math.max(
    0,
    Math.floor(relativeTop / ROW_HEIGHT) - OVERSCAN
  );
  const endIndex = Math.min(
    rows.length,
    Math.ceil((relativeTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN
  );
  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = Math.max(0, (rows.length - endIndex) * ROW_HEIGHT);
  const visibleRows = rows.slice(startIndex, endIndex);

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
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
            'fr-table--no-caption',
            cx('fr-pt-0')
          )}
        >
          <table>
            <colgroup>
              <col style={{ width: '3rem' }} />
              <col style={{ width: '6rem' }} />
              <col style={{ width: '12rem' }} />
              <col style={{ width: '16rem' }} />
              <col />
              <col style={{ width: '4rem' }} />
              <col style={{ width: '4rem' }} />
            </colgroup>

            <thead>
              <tr>
                <th scope="col">
                  <div
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
                  </div>
                </th>
                <th scope="col">
                  <div className="border-left">
                    <ColumnFilterHeader
                      label="N°"
                      options={kindOptions}
                      selectedValues={kindFilter}
                      onChange={onKindFilterChange}
                    />
                  </div>
                </th>
                <th scope="col">
                  <div className="border-left">
                    <ColumnFilterHeader
                      label="Analytes"
                      options={substanceOptions}
                      selectedValues={substanceFilter}
                      onChange={onSubstanceFilterChange}
                    />
                  </div>
                </th>
                <th scope="col">
                  <div className="border-left">
                    <ColumnFilterHeader
                      label="Matrice"
                      options={matrixCombinedOptions}
                      selectedValues={matrixCombinedFilter}
                      onChange={onMatrixCombinedFilterChange}
                    />
                  </div>
                </th>
                <th scope="col" colSpan={3}>
                  <div className="border-left">
                    <ColumnFilterHeader
                      label="Laboratoires agréés"
                      options={labOptions}
                      selectedValues={labFilter}
                      onChange={onLabFilterChange}
                      onReset={() => onLabAgreementTypeFilterChange([])}
                      menuAlign="left"
                      extraActive={labAgreementTypeFilter.length > 0}
                      extraContent={
                        <div className="d-flex-column">
                          <span>Filtrer par type d'agrément</span>
                          <LaboratoryAgreementButtons
                            values={{
                              referenceLaboratory:
                                labAgreementTypeFilter.includes(
                                  'referenceLaboratory'
                                ),
                              detectionAnalysis:
                                labAgreementTypeFilter.includes(
                                  'detectionAnalysis'
                                ),
                              confirmationAnalysis:
                                labAgreementTypeFilter.includes(
                                  'confirmationAnalysis'
                                )
                            }}
                            onToggle={(field) =>
                              onLabAgreementTypeFilterChange(
                                labAgreementTypeFilter.includes(field)
                                  ? labAgreementTypeFilter.filter(
                                      (f) => f !== field
                                    )
                                  : [...labAgreementTypeFilter, field]
                              )
                            }
                          />
                        </div>
                      }
                    />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ height: paddingTop, padding: 0, border: 'none' }}
                  />
                </tr>
              )}

              {visibleRows.map((row) => {
                const rowKey = toRowKey(row);
                return (
                  <AgreementTableRow
                    key={rowKey}
                    row={row}
                    rowKey={rowKey}
                    isSelected={selectedStringRowKeys.includes(rowKey)}
                    isExpanded={expandedRowKeys.includes(rowKey)}
                    isChecked={checksSet.has(rowKey)}
                    isPending={pendingCheckRowKeys.includes(rowKey)}
                    isAnimating={animatingRowKeys.includes(rowKey)}
                    isLabsExpanded={expandedLabRowKeys.includes(rowKey)}
                    isMatrixExpanded={expandedMatrixRowKeys.includes(rowKey)}
                    prescriptions={
                      prescriptionsBySubPlanId.get(row.programmingSubPlan.id) ??
                      []
                    }
                    laboratoriesById={laboratoriesById}
                    onToggleSelect={onToggleRow}
                    onToggleExpand={handleToggleExpand}
                    onToggleLabs={handleToggleLabs}
                    onToggleMatrix={handleToggleMatrix}
                    onOpenModalForRow={onOpenModalForRow}
                    onUpdateCheck={onUpdateCheck}
                    onPendingStart={handlePendingStart}
                    onPendingEnd={handlePendingEnd}
                    onAnimatingStart={handleAnimatingStart}
                    onAnimatingEnd={handleAnimatingEnd}
                  />
                );
              })}

              {paddingBottom > 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      height: paddingBottom,
                      padding: 0,
                      border: 'none'
                    }}
                  />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});

export default LaboratoryAgreementsTable;
