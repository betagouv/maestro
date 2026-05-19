import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Notice from '@codegouvfr/react-dsfr/Notice';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Table from '@codegouvfr/react-dsfr/Table';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  type MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { StageLabels } from 'maestro-shared/referential/Stage';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementField,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import {
  type ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindReference
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ColumnFilterHeader from 'src/components/ColumnFilterHeader/ColumnFilterHeader';
import LaboratoryAgreementButtons from 'src/components/LaboratoryAgreement/LaboratoryAgreementButtons/LaboratoryAgreementButtons';
import { LaboratoryAgreementDetailProvider } from 'src/components/LaboratoryAgreement/LaboratoryAgreementDetailModal/LaboratoryAgreementDetailContext';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { getLaboratoryAgreementsExportURL } from '../../services/laboratory.service';
import { pluralize } from '../../utils/stringUtils';
import LaboratoryAgreementsModal from './LaboratoryAgreementsModal/LaboratoryAgreementsModal';
import './LaboratoryAgreementsView.scss';
import { isNil, uniq } from 'lodash-es';
import YearSelector from './YearSelector/YearSelector';

const agreementsModal = createModal({
  id: 'laboratory-agreements-modal',
  isOpenedByDefault: false
});

const LABS_DISPLAY_LIMIT = 6;
const MATRIX_DISPLAY_LIMIT = 3;

const LaboratoryAgreementsView = () => {
  useDocumentTitle('Agréments laboratoires');
  const apiClient = useContext(ApiClientContext);

  const [year, setYear] = useState<number>();
  const [selectedStringRowKeys, setSelectedStringRowKeys] = useState<string[]>(
    []
  );
  const [modalRowKeys, setModalRowKeys] = useState<LaboratoryAgreementRowKey[]>(
    []
  );
  const [modalAgreements, setModalAgreements] = useState<
    Pick<
      LaboratoryAgreement,
      | 'laboratoryId'
      | 'referenceLaboratory'
      | 'detectionAnalysis'
      | 'confirmationAnalysis'
    >[]
  >([]);
  const [substanceFilter, setSubstanceFilter] = useState<SubstanceKind[]>([]);
  const [labFilter, setLabFilter] = useState<string[]>([]);
  const [labAgreementTypeFilter, setLabAgreementTypeFilter] = useState<
    LaboratoryAgreementField[]
  >([]);
  const [matrixFilter, setMatrixFilter] = useState<MatrixKind[]>([]);
  const [kindFilter, setKindFilter] = useState<ProgrammingPlanKind[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [expandedLabRowKeys, setExpandedLabRowKeys] = useState<string[]>([]);
  const [expandedMatrixRowKeys, setExpandedMatrixRowKeys] = useState<string[]>(
    []
  );
  const [expandedStageRowKeys, setExpandedStageRowKeys] = useState<string[]>(
    []
  );
  const [showWithoutLab, setShowWithoutLab] = useState(false);

  const { data: agreements = [] } = apiClient.useFindLaboratoryAgreementsQuery(
    { year },
    { skip: !year }
  );
  const { data: checks = [] } = apiClient.useFindLaboratoryAgreementChecksQuery(
    { year },
    { skip: !year }
  );
  const { data: allProgrammingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});
  const programmingPlans = useMemo(
    () => allProgrammingPlans.filter((p) => p.year === year),
    [allProgrammingPlans, year]
  );
  const { data: laboratories = [] } = apiClient.useFindLaboratoriesQuery({});
  const [updateAgreements] = apiClient.useUpdateLaboratoryAgreementsMutation();
  const [updateCheck] = apiClient.useUpdateLaboratoryAgreementCheckMutation();

  const { data: allPrescriptions = [] } = apiClient.useFindPrescriptionsQuery(
    { year },
    { skip: !year }
  );

  const availableYears = useMemo(
    () => uniq(allProgrammingPlans.map((p) => p.year)).sort((a, b) => b - a),
    [allProgrammingPlans]
  );

  useEffect(() => {
    if (
      availableYears.length > 0 &&
      isNil(year) &&
      !availableYears.includes(year)
    ) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  const rows = useMemo(() => {
    return programmingPlans.flatMap((plan) =>
      plan.kinds.flatMap((kind) =>
        plan.substanceKinds.map((substanceKind) => ({
          programmingPlanId: plan.id,
          programmingPlanKind: kind,
          programmingPlanYear: plan.year,
          substanceKind,
          laboratories: agreements.filter(
            (a) =>
              a.programmingPlanId === plan.id &&
              a.programmingPlanKind === kind &&
              a.substanceKind === substanceKind
          )
        }))
      )
    );
  }, [agreements, programmingPlans]);

  const kindOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.programmingPlanKind))].map((value) => ({
        value,
        label: ProgrammingPlanKindReference[value]
      })),
    [rows]
  );

  const substanceOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.substanceKind))].map((value) => ({
        value,
        label: SubstanceKindLabels[value]
      })),
    [rows]
  );

  const labsInRows = useMemo(
    () =>
      new Set(rows.flatMap((r) => r.laboratories.map((l) => l.laboratoryId))),
    [rows]
  );

  const labOptions = useMemo(
    () =>
      laboratories
        .toSorted((a, b) => a.shortName.localeCompare(b.shortName))
        .map((l) => ({
          value: l.id,
          label: l.shortName,
          disabled: !labsInRows.has(l.id)
        })),
    [laboratories, labsInRows]
  );

  const matrixOptions = useMemo(
    () =>
      [...new Set(allPrescriptions.map((p) => p.matrixKind))]
        .map((value) => ({
          value,
          label: MatrixKindLabels[value]
        }))
        .toSorted((a, b) => a.label.localeCompare(b.label)),
    [allPrescriptions]
  );

  const filteredRows = useMemo(() => {
    const getFirstMatrixTitle = (
      programmingPlanId: string,
      programmingPlanKind: string
    ) => {
      const titles = allPrescriptions
        .filter(
          (p) =>
            p.programmingPlanId === programmingPlanId &&
            p.programmingPlanKind === programmingPlanKind
        )
        .map(getPrescriptionTitle)
        .sort((a, b) => a.localeCompare(b));
      return titles[0] ?? '';
    };

    return rows
      .filter(
        (r) =>
          (kindFilter.length === 0 ||
            kindFilter.includes(r.programmingPlanKind)) &&
          (substanceFilter.length === 0 ||
            substanceFilter.includes(r.substanceKind)) &&
          (matrixFilter.length === 0 ||
            allPrescriptions.some(
              (p) =>
                p.programmingPlanId === r.programmingPlanId &&
                p.programmingPlanKind === r.programmingPlanKind &&
                matrixFilter.includes(p.matrixKind)
            )) &&
          ((labFilter.length === 0 && labAgreementTypeFilter.length === 0) ||
            r.laboratories.some(
              (l) =>
                (labFilter.length === 0 ||
                  labFilter.includes(l.laboratoryId)) &&
                (labAgreementTypeFilter.length === 0 ||
                  labAgreementTypeFilter.some((field) => l[field]))
            )) &&
          (!showWithoutLab ||
            !r.laboratories.some(
              (l) =>
                l.referenceLaboratory ||
                l.detectionAnalysis ||
                l.confirmationAnalysis
            ))
      )
      .sort((a, b) => {
        const aChecked = checks.some(
          (c) =>
            c.programmingPlanId === a.programmingPlanId &&
            c.programmingPlanKind === a.programmingPlanKind &&
            c.substanceKind === a.substanceKind
        );
        const bChecked = checks.some(
          (c) =>
            c.programmingPlanId === b.programmingPlanId &&
            c.programmingPlanKind === b.programmingPlanKind &&
            c.substanceKind === b.substanceKind
        );
        if (aChecked !== bChecked) {
          return aChecked ? 1 : -1;
        }
        const substanceCmp = SubstanceKindLabels[a.substanceKind].localeCompare(
          SubstanceKindLabels[b.substanceKind]
        );
        if (substanceCmp !== 0) {
          return substanceCmp;
        }
        return getFirstMatrixTitle(
          a.programmingPlanId,
          a.programmingPlanKind
        ).localeCompare(
          getFirstMatrixTitle(b.programmingPlanId, b.programmingPlanKind)
        );
      });
  }, [
    rows,
    kindFilter,
    substanceFilter,
    matrixFilter,
    labFilter,
    labAgreementTypeFilter,
    showWithoutLab,
    allPrescriptions,
    checks
  ]);

  const stringRowKey = (row: (typeof rows)[number]) =>
    `${row.programmingPlanId}_${row.programmingPlanKind}_${row.substanceKind}`;

  const isRowChecked = (row: (typeof rows)[number]) =>
    checks.some(
      (c) =>
        c.programmingPlanId === row.programmingPlanId &&
        c.programmingPlanKind === row.programmingPlanKind &&
        c.substanceKind === row.substanceKind
    );

  const allSelected =
    filteredRows.length > 0 &&
    selectedStringRowKeys.length === filteredRows.length;

  const toggleRow = (key: string) =>
    setSelectedStringRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleAll = () =>
    setSelectedStringRowKeys(allSelected ? [] : filteredRows.map(stringRowKey));

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

  const rowAgreementsSignature = (labs: LaboratoryAgreement[]) =>
    labs
      .map(
        (l) =>
          `${l.laboratoryId}:${l.referenceLaboratory ? 1 : 0}${l.detectionAnalysis ? 1 : 0}${l.confirmationAnalysis ? 1 : 0}`
      )
      .sort()
      .join(',');

  const selectedRows = filteredRows.filter((r) =>
    selectedStringRowKeys.includes(stringRowKey(r))
  );

  const selectedRowsConsistent =
    selectedRows.length <= 1 ||
    selectedRows.every(
      (r) =>
        rowAgreementsSignature(r.laboratories) ===
        rowAgreementsSignature(selectedRows[0].laboratories)
    );

  const handleOpenModal = () => {
    const firstRow = selectedRows[0];
    setModalAgreements(firstRow?.laboratories ?? []);
    setModalRowKeys(selectedRows);
    agreementsModal.open();
  };

  const handleOpenModalForRow = (row: (typeof filteredRows)[number]) => {
    setModalAgreements(row.laboratories);
    setModalRowKeys([row]);
    agreementsModal.open();
  };

  useIsModalOpen(agreementsModal, {
    onConceal: () => {
      setSelectedStringRowKeys([]);
      setModalRowKeys([]);
    }
  });

  const noticeRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

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
  // Le composant Table ne gère pas nativement les cellules avec rowspan ou colspan, on doit donc manipuler le DOM après coup pour faire le rendu souhaité.
  // On utilise useLayoutEffect pour s'assurer que les modifications sont appliquées avant le rendu à l'écran, évitant ainsi les clignotements ou les rendus intermédiaires incorrects.
  useLayoutEffect(() => {
    const table = tableContainerRef.current?.querySelector('table');
    if (!table) {
      return;
    }

    const rows = Array.from(table.querySelectorAll('tbody tr'));

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

    rows.forEach((tr) => {
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

    rows.forEach((tr) => {
      const tds = Array.from(tr.querySelectorAll('td')) as HTMLElement[];
      const checkTd = tds[6];
      if (checkTd?.querySelector('.row-checked')) {
        if (tds[5]) {
          tds[5].setAttribute('colspan', '2');
        }
        checkTd.style.display = 'none';
      }
    });

    rows.forEach((tr, i) => {
      const firstTd = tr.querySelector('td:first-child') as HTMLElement | null;
      if (!firstTd?.querySelector('.row-expanded')) {
        return;
      }
      firstTd.setAttribute('rowspan', '2');
      const nextRow = rows[i + 1];
      if (!nextRow) {
        return;
      }
      const nextTds = Array.from(
        nextRow.querySelectorAll('td')
      ) as HTMLElement[];
      nextTds[0].style.display = 'none';
      nextTds[1].setAttribute('colspan', '5');
    });
  }, [expandedRowKeys, filteredRows, checks]);

  const rowsWithLab = filteredRows.filter((r) =>
    r.laboratories.some(
      (lab) =>
        lab.referenceLaboratory ||
        lab.detectionAnalysis ||
        lab.confirmationAnalysis
    )
  ).length;
  const rowsWithoutLab = filteredRows.length - rowsWithLab;

  if (!year) {
    return <></>;
  }

  return (
    <LaboratoryAgreementDetailProvider
      onSave={async (updated) => {
        await updateAgreements({
          laboratoryId: updated.laboratoryId,
          laboratoryAgreementRowKey: {
            programmingPlanId: updated.programmingPlanId,
            programmingPlanKind: updated.programmingPlanKind,
            substanceKind: updated.substanceKind
          },
          referenceLaboratory: updated.referenceLaboratory,
          detectionAnalysis: updated.detectionAnalysis,
          confirmationAnalysis: updated.confirmationAnalysis
        }).unwrap();
      }}
    >
      <section id="top" className={clsx(cx('fr-container'), 'main-section')}>
        <SectionHeader
          title={
            <div className="d-flex-align-center">
              Agréments laboratoires{' '}
              {availableYears.length <= 1 ? (
                year
              ) : (
                <YearSelector
                  year={Number(year)}
                  years={availableYears}
                  onChange={setYear}
                />
              )}
            </div>
          }
          subtitle={
            <div
              className={clsx(
                cx('fr-text--regular', 'fr-pt-1w'),
                'd-flex-align-center'
              )}
            >
              <span>
                {pluralize(filteredRows.length, { preserveCount: true })(
                  'ligne'
                )}
              </span>
              <span
                className={cx(
                  'fr-icon-checkbox-circle-line',
                  'fr-label--success',
                  'fr-icon--sm',
                  'fr-ml-2w'
                )}
                aria-hidden="true"
              />
              <span className={cx('fr-ml-2v')}>
                {rowsWithLab} avec laboratoire
              </span>
              <span
                className={cx(
                  'fr-icon-time-line',
                  'fr-label--error',
                  'fr-icon--sm',
                  'fr-ml-2w'
                )}
                aria-hidden="true"
              />
              <span className={cx('fr-ml-2v')}>
                {rowsWithoutLab} sans laboratoire
              </span>
            </div>
          }
        />

        <div className={clsx('white-container', cx('fr-p-4w'))}>
          <div
            className={clsx(
              cx('fr-mb-3w'),
              'd-flex-align-center',
              'd-flex-justify-end',
              'no-wrap'
            )}
          >
            <ToggleSwitch
              label="Sous-plans sans laboratoires"
              checked={showWithoutLab}
              onChange={setShowWithoutLab}
              showCheckedHint={false}
            />
            <Button
              iconId="fr-icon-file-download-line"
              priority="secondary"
              onClick={() =>
                window.open(
                  getLaboratoryAgreementsExportURL({
                    year: Number(year),
                    programmingPlanKinds: kindFilter.length
                      ? kindFilter
                      : undefined,
                    substanceKinds: substanceFilter.length
                      ? substanceFilter
                      : undefined,
                    laboratoryIds: labFilter.length ? labFilter : undefined,
                    matrixKinds: matrixFilter.length ? matrixFilter : undefined,
                    withoutLab: showWithoutLab || undefined
                  })
                )
              }
              className={cx('fr-ml-3w')}
            >
              Exporter
            </Button>
          </div>
          <div
            ref={noticeRef}
            className="laboratory-agreements-notice-container"
          >
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
                      onClick={() => setSelectedStringRowKeys([])}
                      className="link-underline"
                    >
                      Déselectionner tout
                    </Button>
                    <Button
                      iconId="fr-icon-microscope-line"
                      priority="secondary"
                      size="small"
                      onClick={handleOpenModal}
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
                          onChange: toggleAll
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
                    onChange={setKindFilter}
                  />
                </div>,
                <div key="header-substance" className="border-left">
                  <ColumnFilterHeader
                    label="Analytes"
                    options={substanceOptions}
                    selectedValues={substanceFilter}
                    onChange={setSubstanceFilter}
                  />
                </div>,
                <div key="header-matrix" className="border-left">
                  <ColumnFilterHeader
                    label="Matrices"
                    options={matrixOptions}
                    selectedValues={matrixFilter}
                    onChange={setMatrixFilter}
                  />
                </div>,
                <div key="header-labs" className="border-left">
                  <ColumnFilterHeader
                    label="Laboratoires agréés"
                    options={labOptions}
                    selectedValues={labFilter}
                    onChange={setLabFilter}
                    menuAlign="right"
                    extraActive={labAgreementTypeFilter.length > 0}
                    extraContent={
                      <div className={clsx('d-flex-align-center')}>
                        <span className={cx('fr-mr-16w')}>
                          Filtrer par type d'agrément
                        </span>
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
                            setLabAgreementTypeFilter((prev) =>
                              prev.includes(field)
                                ? prev.filter((f) => f !== field)
                                : [...prev, field]
                            )
                          }
                        />
                      </div>
                    }
                  />
                </div>
              ]}
              data={filteredRows.flatMap((row) => {
                const rowKey = stringRowKey(row);
                const isExpanded = expandedRowKeys.includes(rowKey);

                const mainRow = [
                  <div
                    key={`select-${rowKey}`}
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
                            onChange: () => toggleRow(rowKey)
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
                      const remaining =
                        allMatrices.length - MATRIX_DISPLAY_LIMIT;
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
                      const isLabsExpanded =
                        expandedLabRowKeys.includes(rowKey);
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
                              iconId={'fr-icon-add-line'}
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
                      onClick={() => handleOpenModalForRow(row)}
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
                            checked: isRowChecked(row),
                            title: isRowChecked(row)
                              ? 'Marquer comme non vérifié'
                              : 'Marquer comme vérifié',
                            onChange: () =>
                              updateCheck({
                                programmingPlanId: row.programmingPlanId,
                                programmingPlanKind: row.programmingPlanKind,
                                substanceKind: row.substanceKind,
                                checked: !isRowChecked(row)
                              })
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
                              {visibleStages
                                .map((s) => StageLabels[s])
                                .join(', ')}
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
        </div>
        <LaboratoryAgreementsModal
          modal={agreementsModal}
          laboratoryAgreementRowKeys={modalRowKeys}
          agreements={modalAgreements}
          laboratories={laboratories}
          onSave={async (laboratoryId, input) => {
            await updateAgreements({ laboratoryId, ...input }).unwrap();
          }}
        />
        <div className={cx('fr-mt-2w')}>
          <Button
            iconId="fr-icon-arrow-up-fill"
            priority="tertiary no outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Haut de page
          </Button>
        </div>
      </section>
    </LaboratoryAgreementDetailProvider>
  );
};

export default LaboratoryAgreementsView;
