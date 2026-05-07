import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Notice from '@codegouvfr/react-dsfr/Notice';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import type { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import microscope from 'src/assets/illustrations/microscope.svg';
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [modalGroups, setModalGroups] = useState<
    Array<{
      programmingPlanId: string;
      programmingPlanKind: ProgrammingPlanKind;
      substanceKind: SubstanceKind;
    }>
  >([]);

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
      [...new Set(agreements.map((a) => a.programmingPlanYear))].sort(
        (a, b) => b - a
      ),
    [agreements]
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

  const rowKey = (row: (typeof rows)[number]) =>
    `${row.programmingPlanId}_${row.programmingPlanKind}_${row.substanceKind}`;

  const allSelected = rows.length > 0 && selectedRowKeys.length === rows.length;

  const toggleRow = (key: string) =>
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleAll = () =>
    setSelectedRowKeys(allSelected ? [] : rows.map(rowKey));

  const handleOpenModal = () => {
    setModalGroups(
      rows
        .filter((g) => selectedRowKeys.includes(rowKey(g)))
        .map((g) => ({
          programmingPlanId: g.programmingPlanId,
          programmingPlanKind: g.programmingPlanKind,
          substanceKind: g.substanceKind
        }))
    );
    agreementsModal.open();
  };

  const handleOpenModalForRow = (g: (typeof rows)[number]) => {
    setModalGroups([
      {
        programmingPlanId: g.programmingPlanId,
        programmingPlanKind: g.programmingPlanKind,
        substanceKind: g.substanceKind
      }
    ]);
    agreementsModal.open();
  };

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
  }, [selectedRowKeys]);

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
          {selectedRowKeys.length > 0 && (
            <Notice
              className={cx('fr-mb-2w')}
              title={pluralize(selectedRowKeys.length, { preserveCount: true })(
                'plan sélectionné'
              )}
              description={
                <Button
                  iconId="fr-icon-microscope-line"
                  priority="secondary"
                  size="small"
                  onClick={handleOpenModal}
                >
                  Affecter les laboratoires
                </Button>
              }
              severity="info"
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
              <div key="header-kind" className="border-left">
                Type de plan
              </div>,
              <div key="header-substance" className="border-left">
                Substance
              </div>,
              <div key="header-labs" className="border-left">
                Laboratoires agréés
              </div>,
              <div key="header-action" />
            ]}
            data={rows.map((row) => [
              <div key={`select-${rowKey(row)}`} className="selectable-cell">
                <Checkbox
                  options={[
                    {
                      label: '',
                      nativeInputProps: {
                        checked: selectedRowKeys.includes(rowKey(row)),
                        onChange: () => toggleRow(rowKey(row))
                      }
                    }
                  ]}
                  small
                />
              </div>,
              <div key={`kind-${rowKey(row)}`} className="border-left">
                {
                  ProgrammingPlanKindLabels[
                    row.programmingPlanKind as keyof typeof ProgrammingPlanKindLabels
                  ]
                }
              </div>,
              <div key={`substance-${rowKey(row)}`} className="border-left">
                {
                  SubstanceKindLabels[
                    row.substanceKind as keyof typeof SubstanceKindLabels
                  ]
                }
              </div>,
              <div
                key={`labs-${rowKey(row)}`}
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
                  .toSorted((laboratory, b) =>
                    laboratory.laboratoryShortName.localeCompare(
                      b.laboratoryShortName
                    )
                  )
                  .map((laboratory) => (
                    <LaboratoryAgreementTag
                      key={laboratory.laboratoryShortName}
                      shortName={
                        laboratory.laboratoryShortName as LaboratoryShortName
                      }
                      referenceLaboratory={laboratory.referenceLaboratory}
                      detectionAnalysis={laboratory.detectionAnalysis}
                      confirmationAnalysis={laboratory.confirmationAnalysis}
                      onToggle={() => {}}
                    />
                  ))}
              </div>,
              <div key={`action-${rowKey(row)}`}>
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
        selectedGroups={modalGroups}
        agreements={agreements}
        laboratories={laboratories}
        onSave={async (input) => {
          await updateAgreements(input).unwrap();
        }}
      />
    </section>
  );
};

export default LaboratoryAgreementsView;
