import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  type MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementField,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import {
  type ProgrammingPlanKind,
  ProgrammingPlanKindReference
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import YearSelector from './YearSelector/YearSelector';

const agreementsModal = createModal({
  id: 'laboratory-agreements-modal',
  isOpenedByDefault: false
});

const LaboratoryAgreementsView = () => {
  useDocumentTitle('Agréments laboratoires');
  const apiClient = useContext(ApiClientContext);

  const [year, setYear] = useState<number>();
  const [selectedStringRowKeys, setSelectedStringRowKeys] = useState<string[]>([]);
  const [modalRowKeys, setModalRowKeys] = useState<LaboratoryAgreementRowKey[]>([]);
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
  const [labAgreementTypeFilter, setLabAgreementTypeFilter] = useState<LaboratoryAgreementField[]>([]);
  const [matrixFilter, setMatrixFilter] = useState<MatrixKind[]>([]);
  const [kindFilter, setKindFilter] = useState<ProgrammingPlanKind[]>([]);
  const [showWithoutLab, setShowWithoutLab] = useState(false);

  const { data: agreements = [] } = apiClient.useFindLaboratoryAgreementsQuery(
    { year },
    { skip: !year }
  );
  const { data: checks = [] } = apiClient.useFindLaboratoryAgreementChecksQuery(
    { year },
    { skip: !year }
  );
  const { data: allProgrammingPlans = [] } = apiClient.useFindProgrammingPlansQuery({});
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
    if (availableYears.length > 0 && (isNil(year) || !availableYears.includes(year))) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  const rows = useMemo(
    () =>
      programmingPlans.flatMap((plan) =>
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
      ),
    [agreements, programmingPlans]
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

  const labsInRows = useMemo(
    () => new Set(rows.flatMap((r) => r.laboratories.map((l) => l.laboratoryId))),
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
        .map((value) => ({ value, label: MatrixKindLabels[value] }))
        .toSorted((a, b) => a.label.localeCompare(b.label)),
    [allPrescriptions]
  );

  const filteredRows = useMemo(() => {
    const getFirstMatrixTitle = (programmingPlanId: string, programmingPlanKind: string) => {
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
          (kindFilter.length === 0 || kindFilter.includes(r.programmingPlanKind)) &&
          (substanceFilter.length === 0 || substanceFilter.includes(r.substanceKind)) &&
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
                (labFilter.length === 0 || labFilter.includes(l.laboratoryId)) &&
                (labAgreementTypeFilter.length === 0 ||
                  labAgreementTypeFilter.some((field) => l[field]))
            )) &&
          (!showWithoutLab ||
            !r.laboratories.some(
              (l) => l.referenceLaboratory || l.detectionAnalysis || l.confirmationAnalysis
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
        if (aChecked !== bChecked) return aChecked ? 1 : -1;
        const substanceCmp = SubstanceKindLabels[a.substanceKind].localeCompare(
          SubstanceKindLabels[b.substanceKind]
        );
        if (substanceCmp !== 0) return substanceCmp;
        return getFirstMatrixTitle(a.programmingPlanId, a.programmingPlanKind).localeCompare(
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

  const allSelected =
    filteredRows.length > 0 && selectedStringRowKeys.length === filteredRows.length;

  const toggleExpand = (key: string) =>
    setExpandedRowKeys((prev) =>
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
    selectedStringRowKeys.includes(toRowKey(r))
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

  const handleOpenModalForRow = (row: AgreementRow) => {
    setModalAgreements(row.laboratories);
    setModalRowKeys([row]);
    agreementsModal.open();
  };

  const isDetailModalOpen = useRef(false);

  useEffect(() => {
    setSelectedStringRowKeys([]);
  }, [kindFilter, substanceFilter, matrixFilter, labFilter, labAgreementTypeFilter, showWithoutLab]);

  useIsModalOpen(agreementsModal, {
    onConceal: () => {
      if (isDetailModalOpen.current) return;
      setSelectedStringRowKeys([]);
      setModalRowKeys([]);
    }
  });

  const rowsWithLab = rows.filter((r) =>
    r.laboratories.some(
      (lab) => lab.referenceLaboratory || lab.detectionAnalysis || lab.confirmationAnalysis
    )
  ).length;
  const rowsWithoutLab = rows.length - rowsWithLab;

  if (!year) return null;

  return (
    <LaboratoryAgreementDetailProvider
      onOpen={() => { isDetailModalOpen.current = true; }}
      onConceal={() => { isDetailModalOpen.current = false; }}
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
                <YearSelector year={Number(year)} years={availableYears} onChange={setYear} />
              )}
            </div>
          }
          subtitle={
            <div
              className={clsx(cx('fr-text--regular', 'fr-pt-1w'), 'd-flex-align-center')}
            >
              <span>{pluralize(rows.length, { preserveCount: true })('ligne')}</span>
              <span
                className={cx('fr-icon-checkbox-circle-line', 'fr-label--success', 'fr-icon--sm', 'fr-ml-2w')}
                aria-hidden="true"
              />
              <span className={cx('fr-ml-2v')}>{rowsWithLab} avec laboratoire</span>
              <span
                className={cx('fr-icon-time-line', 'fr-label--error', 'fr-icon--sm', 'fr-ml-2w')}
                aria-hidden="true"
              />
              <span className={cx('fr-ml-2v')}>{rowsWithoutLab} sans laboratoire</span>
            </div>
          }
        />
        <div className={clsx('white-container', cx('fr-p-4w'))}>
          <div
            className={clsx(cx('fr-mb-3w'), 'd-flex-align-center', 'd-flex-justify-end', 'no-wrap')}
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
                    programmingPlanKinds: kindFilter.length ? kindFilter : undefined,
                    substanceKinds: substanceFilter.length ? substanceFilter : undefined,
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
          <LaboratoryAgreementsTable
            rows={filteredRows}
            selectedStringRowKeys={selectedStringRowKeys}
            allSelected={allSelected}
            selectedRowsConsistent={selectedRowsConsistent}
            checks={checks}
            laboratories={laboratories}
            allPrescriptions={allPrescriptions}
            kindFilter={kindFilter}
            kindOptions={kindOptions}
            onKindFilterChange={setKindFilter}
            substanceFilter={substanceFilter}
            substanceOptions={substanceOptions}
            onSubstanceFilterChange={setSubstanceFilter}
            matrixFilter={matrixFilter}
            matrixOptions={matrixOptions}
            onMatrixFilterChange={setMatrixFilter}
            labFilter={labFilter}
            labOptions={labOptions}
            onLabFilterChange={setLabFilter}
            labAgreementTypeFilter={labAgreementTypeFilter}
            onLabAgreementTypeFilterChange={setLabAgreementTypeFilter}
            onToggleRow={(key) =>
              setSelectedStringRowKeys((prev) =>
                prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
              )
            }
            onToggleAll={() =>
              setSelectedStringRowKeys(allSelected ? [] : filteredRows.map(toRowKey))
            }
            onDeselect={() => setSelectedStringRowKeys([])}
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
