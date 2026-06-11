import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { MatrixList } from 'maestro-shared/referential/Matrix/Matrix';
import {
  type MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { LaboratoryAgreementDetailProvider } from 'src/components/LaboratoryAgreement/LaboratoryAgreementDetailModal/LaboratoryAgreementDetailContext';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { getLaboratoryAgreementsExportURL } from '../../services/laboratory.service';
import { pluralize } from '../../utils/stringUtils';
import LaboratoryAgreementsModal from './LaboratoryAgreementsModal/LaboratoryAgreementsModal';
import LaboratoryAgreementsTable, {
  type AgreementRow,
  toRowKey
} from './LaboratoryAgreementsTable/LaboratoryAgreementsTable';
import './LaboratoryAgreementsView.scss';
import { isNil, uniq } from 'lodash-es';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementField,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import YearSelector from './YearSelector/YearSelector';

const agreementsModal = createModal({
  id: 'laboratory-agreements-modal',
  isOpenedByDefault: false
});

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
  const [modalProgrammingSubPlan, setModalProgrammingSubPlan] =
    useState<ProgrammingSubPlan>();
  const [substanceFilter, setSubstanceFilter] = useState<SubstanceKind[]>([]);
  const [labFilter, setLabFilter] = useState<string[]>([]);
  const [labAgreementTypeFilter, setLabAgreementTypeFilter] = useState<
    LaboratoryAgreementField[]
  >([]);
  const [matrixCombinedFilter, setMatrixCombinedFilter] = useState<string[]>(
    []
  );
  const [subPlanFilter, setSubPlanFilter] = useState<ProgrammingSubPlanId[]>(
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
      (isNil(year) || !availableYears.includes(year))
    ) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  const rows = useMemo(
    () =>
      programmingPlans.flatMap((plan) =>
        plan.subPlans.flatMap((subPlan) =>
          subPlan.substanceKinds.map((substanceKind) => ({
            programmingSubPlan: subPlan,
            programmingPlanYear: plan.year,
            substanceKind,
            laboratories: agreements.filter(
              (a) =>
                a.programmingSubPlanId === subPlan.id &&
                a.substanceKind === substanceKind
            )
          }))
        )
      ),
    [agreements, programmingPlans]
  );

  const subPlanOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.programmingSubPlan.id))].map((value) => {
        const row = rows.find((r) => r.programmingSubPlan.id === value);
        return {
          value,
          label: row?.programmingSubPlan.codeNat ?? value
        };
      }),
    [rows]
  );

  const substanceOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.substanceKind))]
        .map((value) => ({
          value,
          label: SubstanceKindLabels[value]
        }))
        .toSorted((a, b) => a.label.localeCompare(b.label)),
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

  const matrixCombinedOptions = useMemo(() => {
    const kindOptions = [...new Set(allPrescriptions.map((p) => p.matrixKind))]
      .map((kind) => ({
        value: `kind:${kind}`,
        label: MatrixKindLabels[kind]
      }))
      .toSorted((a, b) => a.label.localeCompare(b.label));

    const matrixToKind = new Map<string, MatrixKind>();
    for (const p of allPrescriptions) {
      if (p.matrix) {
        matrixToKind.set(p.matrix, p.matrixKind);
      }
    }

    const specificMatrixOptions = MatrixList.filter((m) =>
      allPrescriptions.some((p) => p.matrix === m)
    )
      .map((m) => {
        const kind = matrixToKind.get(m);
        const kindLabel = kind ? MatrixKindLabels[kind] : '';
        return {
          value: `matrix:${m}`,
          label: kindLabel
            ? `${kindLabel} > ${MatrixLabels[m]}`
            : MatrixLabels[m]
        };
      })
      .toSorted((a, b) => a.label.localeCompare(b.label));

    return [...kindOptions, ...specificMatrixOptions];
  }, [allPrescriptions]);

  const filteredRows = useMemo(() => {
    const prescriptionsBySubPlanId = new Map<string, typeof allPrescriptions>();
    for (const p of allPrescriptions) {
      const arr = prescriptionsBySubPlanId.get(p.programmingSubPlanId) ?? [];
      arr.push(p);
      prescriptionsBySubPlanId.set(p.programmingSubPlanId, arr);
    }

    const checksSet = new Set(
      checks.map((c) => `${c.programmingSubPlanId}_${c.substanceKind}`)
    );

    const getFirstMatrixTitle = (programmingSubPlanId: string) => {
      const prescriptions =
        prescriptionsBySubPlanId.get(programmingSubPlanId) ?? [];
      const titles = prescriptions
        .map(getPrescriptionTitle)
        .sort((a, b) => a.localeCompare(b));
      return titles[0] ?? '';
    };

    return rows
      .filter(
        (r) =>
          (subPlanFilter.length === 0 ||
            subPlanFilter.includes(r.programmingSubPlan.id)) &&
          (substanceFilter.length === 0 ||
            substanceFilter.includes(r.substanceKind)) &&
          (matrixCombinedFilter.length === 0 ||
            (prescriptionsBySubPlanId.get(r.programmingSubPlan.id) ?? []).some(
              (p) =>
                matrixCombinedFilter.some(
                  (v) =>
                    (v.startsWith('kind:') && p.matrixKind === v.slice(5)) ||
                    (v.startsWith('matrix:') &&
                      p.matrix != null &&
                      p.matrix === v.slice(7))
                )
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
        const aKey = `${a.programmingSubPlan.id}_${a.substanceKind}`;
        const bKey = `${b.programmingSubPlan.id}_${b.substanceKind}`;
        const aChecked = checksSet.has(aKey);
        const bChecked = checksSet.has(bKey);
        if (aChecked !== bChecked) {
          return aChecked ? 1 : -1;
        }
        const substanceCmp = SubstanceKindLabels[a.substanceKind].localeCompare(
          SubstanceKindLabels[b.substanceKind]
        );
        if (substanceCmp !== 0) {
          return substanceCmp;
        }
        return getFirstMatrixTitle(a.programmingSubPlan.id).localeCompare(
          getFirstMatrixTitle(b.programmingSubPlan.id)
        );
      });
  }, [
    rows,
    subPlanFilter,
    substanceFilter,
    matrixCombinedFilter,
    labFilter,
    labAgreementTypeFilter,
    showWithoutLab,
    allPrescriptions,
    checks
  ]);

  const deferredFilteredRows = useDeferredValue(filteredRows);

  const allSelected =
    filteredRows.length > 0 &&
    selectedStringRowKeys.length === filteredRows.length;

  const rowAgreementsSignature = (labs: LaboratoryAgreement[]) =>
    labs
      .map(
        (l) =>
          `${l.laboratoryId}:${l.referenceLaboratory ? 1 : 0}${l.detectionAnalysis ? 1 : 0}${l.confirmationAnalysis ? 1 : 0}`
      )
      .sort()
      .join(',');

  const selectedRows = useMemo(
    () =>
      filteredRows.filter((r) => selectedStringRowKeys.includes(toRowKey(r))),
    [filteredRows, selectedStringRowKeys]
  );

  const selectedRowsConsistent =
    selectedRows.length <= 1 ||
    selectedRows.every(
      (r) =>
        rowAgreementsSignature(r.laboratories) ===
        rowAgreementsSignature(selectedRows[0].laboratories)
    );

  const rowsWithLab = useMemo(
    () =>
      rows.filter((r) =>
        r.laboratories.some(
          (lab) =>
            lab.referenceLaboratory ||
            lab.detectionAnalysis ||
            lab.confirmationAnalysis
        )
      ).length,
    [rows]
  );
  const rowsWithoutLab = rows.length - rowsWithLab;

  const isDetailModalOpen = useRef(false);

  const handleOpenModal = useCallback(() => {
    const firstRow = selectedRows[0];
    setModalAgreements(firstRow?.laboratories ?? []);
    setModalRowKeys(
      selectedRows.map((row) => ({
        programmingSubPlanId: row.programmingSubPlan.id,
        substanceKind: row.substanceKind
      }))
    );
    setModalProgrammingSubPlan(firstRow.programmingSubPlan);
    agreementsModal.open();
  }, [selectedRows]);

  const handleOpenModalForRow = useCallback((row: AgreementRow) => {
    setModalAgreements(row.laboratories);
    setModalRowKeys([
      {
        programmingSubPlanId: row.programmingSubPlan.id,
        substanceKind: row.substanceKind
      }
    ]);
    setModalProgrammingSubPlan(row.programmingSubPlan);
    agreementsModal.open();
  }, []);

  const handleToggleRow = useCallback(
    (key: string) =>
      setSelectedStringRowKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      ),
    []
  );

  const handleToggleAll = useCallback(
    () =>
      setSelectedStringRowKeys((prev) =>
        prev.length === filteredRows.length ? [] : filteredRows.map(toRowKey)
      ),
    [filteredRows]
  );

  const handleDeselect = useCallback(() => setSelectedStringRowKeys([]), []);

  useEffect(() => {
    setSelectedStringRowKeys([]);
  }, [
    subPlanFilter,
    substanceFilter,
    matrixCombinedFilter,
    labFilter,
    labAgreementTypeFilter,
    showWithoutLab
  ]);

  useIsModalOpen(agreementsModal, {
    onConceal: () => {
      if (isDetailModalOpen.current) {
        return;
      }
      setSelectedStringRowKeys([]);
      setModalRowKeys([]);
    }
  });

  if (!year) {
    return null;
  }

  return (
    <LaboratoryAgreementDetailProvider
      onOpen={() => {
        isDetailModalOpen.current = true;
      }}
      onConceal={() => {
        isDetailModalOpen.current = false;
      }}
      onSave={async (updated) => {
        await updateAgreements({
          laboratoryId: updated.laboratoryId,
          laboratoryAgreementRowKey: {
            programmingSubPlanId: updated.programmingSubPlanId,
            substanceKind: updated.substanceKind
          },
          referenceLaboratory: updated.referenceLaboratory,
          detectionAnalysis: updated.detectionAnalysis,
          confirmationAnalysis: updated.confirmationAnalysis
        }).unwrap();
        setModalAgreements((prev) =>
          prev.some((a) => a.laboratoryId === updated.laboratoryId)
            ? prev.map((a) =>
                a.laboratoryId === updated.laboratoryId
                  ? {
                      laboratoryId: updated.laboratoryId,
                      referenceLaboratory: updated.referenceLaboratory,
                      detectionAnalysis: updated.detectionAnalysis,
                      confirmationAnalysis: updated.confirmationAnalysis
                    }
                  : a
              )
            : [
                ...prev,
                {
                  laboratoryId: updated.laboratoryId,
                  referenceLaboratory: updated.referenceLaboratory,
                  detectionAnalysis: updated.detectionAnalysis,
                  confirmationAnalysis: updated.confirmationAnalysis
                }
              ]
        );
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
                {pluralize(rows.length, { preserveCount: true })('ligne')}
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
              label="Lignes sans laboratoires"
              checked={showWithoutLab}
              onChange={setShowWithoutLab}
              showCheckedHint={false}
              disabled={rowsWithoutLab === 0}
            />
            <Button
              iconId="fr-icon-file-download-line"
              priority="secondary"
              onClick={() =>
                window.open(
                  getLaboratoryAgreementsExportURL({
                    year: Number(year),
                    programmingSubPlanIds: subPlanFilter.length
                      ? subPlanFilter
                      : undefined,
                    substanceKinds: substanceFilter.length
                      ? substanceFilter
                      : undefined,
                    laboratoryIds: labFilter.length ? labFilter : undefined,
                    matrixKinds: matrixCombinedFilter
                      .filter((v) => v.startsWith('kind:'))
                      .map((v) => v.slice(5) as MatrixKind).length
                      ? matrixCombinedFilter
                          .filter((v) => v.startsWith('kind:'))
                          .map((v) => v.slice(5) as MatrixKind)
                      : undefined,
                    withoutLab: showWithoutLab || undefined
                  })
                )
              }
              className={cx('fr-ml-3w')}
            >
              Exporter
            </Button>
          </div>
          <LaboratoryAgreementsTable
            rows={deferredFilteredRows}
            selectedStringRowKeys={selectedStringRowKeys}
            allSelected={allSelected}
            selectedRowsConsistent={selectedRowsConsistent}
            checks={checks}
            laboratories={laboratories}
            allPrescriptions={allPrescriptions}
            kindFilter={subPlanFilter}
            kindOptions={subPlanOptions}
            onKindFilterChange={setSubPlanFilter}
            substanceFilter={substanceFilter}
            substanceOptions={substanceOptions}
            onSubstanceFilterChange={setSubstanceFilter}
            matrixCombinedFilter={matrixCombinedFilter}
            matrixCombinedOptions={matrixCombinedOptions}
            onMatrixCombinedFilterChange={setMatrixCombinedFilter}
            labFilter={labFilter}
            labOptions={labOptions}
            onLabFilterChange={setLabFilter}
            labAgreementTypeFilter={labAgreementTypeFilter}
            onLabAgreementTypeFilterChange={setLabAgreementTypeFilter}
            onToggleRow={handleToggleRow}
            onToggleAll={handleToggleAll}
            onDeselect={handleDeselect}
            onOpenModal={handleOpenModal}
            onOpenModalForRow={handleOpenModalForRow}
            onUpdateCheck={updateCheck}
          />
        </div>
        <LaboratoryAgreementsModal
          modal={agreementsModal}
          laboratoryAgreementRowKeys={modalRowKeys}
          agreements={modalAgreements}
          laboratories={laboratories}
          programmingSubPlan={modalProgrammingSubPlan}
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
