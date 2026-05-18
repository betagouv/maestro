import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Notice from '@codegouvfr/react-dsfr/Notice';
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
import { useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ColumnFilterHeader from 'src/components/ColumnFilterHeader/ColumnFilterHeader';
import { LaboratoryAgreementDetailProvider } from 'src/components/LaboratoryAgreement/LaboratoryAgreementDetailModal/LaboratoryAgreementDetailContext';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { getLaboratoryAgreementsExportURL } from '../../services/laboratory.service';
import { pluralize } from '../../utils/stringUtils';
import LaboratoryAgreementsModal from './LaboratoryAgreementsModal/LaboratoryAgreementsModal';
import './LaboratoryAgreementsView.scss';

const agreementsModal = createModal({
  id: 'laboratory-agreements-modal',
  isOpenedByDefault: false
});

const LABS_DISPLAY_LIMIT = 7;
const MATRIX_DISPLAY_LIMIT = 3;

const LaboratoryAgreementsView = () => {
  useDocumentTitle('Agréments laboratoires');
  const apiClient = useContext(ApiClientContext);

  const [year, _setYear] = useState(String(new Date().getFullYear()));
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
    {}
  );
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery(
      { year: year ? Number(year) : undefined },
      { skip: !year }
    );
  const { data: laboratories = [] } = apiClient.useFindLaboratoriesQuery({});
  const [updateAgreements] = apiClient.useUpdateLaboratoryAgreementsMutation();

  const { data: allPrescriptions = [] } = apiClient.useFindPrescriptionsQuery(
    { year: Number(year) },
    { skip: !year }
  );

  const rows = useMemo(
    () =>
      programmingPlans
        .flatMap((plan) =>
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
        )
        .sort(
          (a, b) =>
            a.substanceKind.localeCompare(b.substanceKind) ||
            a.programmingPlanKind.localeCompare(b.programmingPlanKind)
        ),
    [agreements, programmingPlans, year]
  );

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

  const labOptions = useMemo(
    () =>
      laboratories
        .toSorted((a, b) => a.shortName.localeCompare(b.shortName))
        .map((l) => ({ value: l.id, label: l.shortName })),
    [laboratories]
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

  const filteredRows = useMemo(
    () =>
      rows.filter(
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
          (labFilter.length === 0 ||
            r.laboratories.some((l) => labFilter.includes(l.laboratoryId))) &&
          (!showWithoutLab ||
            !r.laboratories.some(
              (l) =>
                l.referenceLaboratory ||
                l.detectionAnalysis ||
                l.confirmationAnalysis
            ))
      ),
    [
      rows,
      kindFilter,
      substanceFilter,
      matrixFilter,
      labFilter,
      showWithoutLab,
      allPrescriptions
    ]
  );

  const stringRowKey = (row: (typeof rows)[number]) =>
    `${row.programmingPlanId}_${row.programmingPlanKind}_${row.substanceKind}`;

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

    rows.forEach((tr) => {
      const tds = Array.from(tr.querySelectorAll('td')) as HTMLElement[];
      tds.forEach((td) => {
        td.removeAttribute('rowspan');
        td.removeAttribute('colspan');
        td.style.display = '';
      });
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
  }, [expandedRowKeys, filteredRows]);

  const rowsWithLab = filteredRows.filter((r) =>
    r.laboratories.some(
      (lab) =>
        lab.referenceLaboratory ||
        lab.detectionAnalysis ||
        lab.confirmationAnalysis
    )
  ).length;
  const rowsWithoutLab = filteredRows.length - rowsWithLab;

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
          title={<>Agréments laboratoires {year}</>}
          subtitle={
            <div
              className={clsx(
                cx('fr-text--regular', 'fr-pt-1w'),
                'd-flex-align-center'
              )}
            >
              <span>
                {pluralize(filteredRows.length, { preserveCount: true })(
                  "ligne d'agrément"
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
                  Laboratoires agréés
                </div>,
                <div key="header-action">
                  <ColumnFilterHeader
                    options={labOptions}
                    selectedValues={labFilter}
                    onChange={setLabFilter}
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
                  <div key={`action-${rowKey}`}>
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
                  </div>
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
