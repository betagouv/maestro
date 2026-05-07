import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Notice from '@codegouvfr/react-dsfr/Notice';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import type { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementRowKey
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import {
  type ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindReference
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import microscope from 'src/assets/illustrations/microscope.svg';
import ColumnFilterHeader from 'src/components/ColumnFilterHeader/ColumnFilterHeader';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { pluralize } from '../../utils/stringUtils';
import LaboratoryAgreementsModal from './LaboratoryAgreementsModal';
import './LaboratoryAgreementsView.scss';

const agreementsModal = createModal({
  id: 'laboratory-agreements-modal',
  isOpenedByDefault: false
});

const LaboratoryAgreementsView = () => {
  useDocumentTitle('Agréments laboratoires');
  const apiClient = useContext(ApiClientContext);

  const [year, setYear] = useState(String(new Date().getFullYear()));
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
  const [kindFilter, setKindFilter] = useState<ProgrammingPlanKind[]>([]);
  const [substanceFilter, setSubstanceFilter] = useState<SubstanceKind[]>([]);

  const { data: agreements = [] } =
    apiClient.useFindLaboratoryAgreementsQuery();
  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery(
      { year: year ? Number(year) : undefined },
      { skip: !year }
    );
  const { data: laboratories = [] } = apiClient.useFindLaboratoriesQuery({});
  const [updateAgreements] = apiClient.useUpdateLaboratoryAgreementsMutation();

  const years = useMemo(
    () =>
      [...new Set(programmingPlans.map((p) => p.year))].sort((a, b) => b - a),
    [programmingPlans]
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
        label: ProgrammingPlanKindLabels[value]
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

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (kindFilter.length === 0 ||
            kindFilter.includes(r.programmingPlanKind)) &&
          (substanceFilter.length === 0 ||
            substanceFilter.includes(r.substanceKind))
      ),
    [rows, kindFilter, substanceFilter]
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

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Agréments laboratoires"
        illustration={microscope}
        action={
          <Select
            label="Année"
            nativeSelectProps={{
              value: year,
              onChange: (e) => setYear(e.target.value)
            }}
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </Select>
        }
      />
      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
        <div ref={noticeRef} className="laboratory-agreements-notice">
          {selectedStringRowKeys.length > 0 && (
            <Notice
              className={cx('fr-mb-2w')}
              title={pluralize(selectedStringRowKeys.length, {
                preserveCount: true
              })('plan sélectionné')}
              description={
                selectedRowsConsistent ? (
                  <Button
                    iconId="fr-icon-microscope-line"
                    priority="secondary"
                    size="small"
                    onClick={handleOpenModal}
                  >
                    Affecter les laboratoires
                  </Button>
                ) : (
                  <span>
                    Les plans sélectionnés ont des agréments différents.
                    Veuillez les modifier individuellement.
                  </span>
                )
              }
              severity={selectedRowsConsistent ? 'info' : 'warning'}
              iconDisplayed={true}
              isClosable={false}
            />
          )}
        </div>
        <div className="laboratory-agreements-table-wrapper laboratory-agreements-table">
          <Table
            noCaption
            bordered
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
                />
              </div>,
              <div key="header-reference" className="border-left">
                ID
              </div>,
              <div key="header-kind" className="border-left">
                <ColumnFilterHeader
                  label="Type de plan"
                  options={kindOptions}
                  selectedValues={kindFilter}
                  onChange={setKindFilter}
                />
              </div>,
              <div key="header-substance" className="border-left">
                <ColumnFilterHeader
                  label="Substance"
                  options={substanceOptions}
                  selectedValues={substanceFilter}
                  onChange={setSubstanceFilter}
                />
              </div>,
              <div key="header-labs" className="border-left">
                Laboratoires agréés
              </div>,
              <div key="header-action" />
            ]}
            data={filteredRows.map((row) => [
              <div
                key={`select-${stringRowKey(row)}`}
                className="selectable-cell"
              >
                <Checkbox
                  options={[
                    {
                      label: '',
                      nativeInputProps: {
                        checked: selectedStringRowKeys.includes(
                          stringRowKey(row)
                        ),
                        onChange: () => toggleRow(stringRowKey(row))
                      }
                    }
                  ]}
                  small
                />
              </div>,
              <div
                key={`reference-${stringRowKey(row)}`}
                className="border-left"
              >
                {ProgrammingPlanKindReference[row.programmingPlanKind]}
              </div>,
              <div key={`kind-${stringRowKey(row)}`} className="border-left">
                {ProgrammingPlanKindLabels[row.programmingPlanKind]}
              </div>,
              <div
                key={`substance-${stringRowKey(row)}`}
                className="border-left"
              >
                {SubstanceKindLabels[row.substanceKind]}
              </div>,
              <div
                key={`labs-${stringRowKey(row)}`}
                className="border-left"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}
              >
                {row.laboratories
                  .filter(
                    (lab) =>
                      lab.referenceLaboratory ||
                      lab.detectionAnalysis ||
                      lab.confirmationAnalysis
                  )
                  .map((lab) => ({
                    ...lab,
                    shortName: laboratories.find(
                      (l) => l.id === lab.laboratoryId
                    )?.shortName
                  }))
                  .filter((lab) => lab.shortName != null)
                  .toSorted((a, b) => a.shortName!.localeCompare(b.shortName!))
                  .map((lab) => (
                    <LaboratoryAgreementTag
                      key={lab.laboratoryId}
                      shortName={lab.shortName as LaboratoryShortName}
                      referenceLaboratory={lab.referenceLaboratory}
                      detectionAnalysis={lab.detectionAnalysis}
                      confirmationAnalysis={lab.confirmationAnalysis}
                      onToggle={() => {}}
                    />
                  ))}
              </div>,
              <div key={`action-${stringRowKey(row)}`}>
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
            ])}
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
    </section>
  );
};

export default LaboratoryAgreementsView;
