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
import { useContext, useMemo, useState } from 'react';
import microscope from 'src/assets/illustrations/microscope.svg';
import LaboratoryAgreementTag from 'src/components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { pluralize } from '../../utils/stringUtils';
import LaboratoryAgreementsModal from './LaboratoryAgreementsModal';

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
  const { data: laboratories = [] } = apiClient.useFindLaboratoriesQuery({});
  const [updateAgreements] = apiClient.useUpdateLaboratoryAgreementsMutation();

  const years = useMemo(
    () =>
      [...new Set(agreements.map((a) => a.programmingPlanYear))].sort(
        (a, b) => b - a
      ),
    [agreements]
  );

  const grouped = useMemo(() => {
    const filtered = agreements.filter(
      (a) => !year || String(a.programmingPlanYear) === year
    );

    const map = new Map<
      string,
      {
        programmingPlanId: string;
        programmingPlanKind: ProgrammingPlanKind;
        programmingPlanYear: number;
        substanceKind: SubstanceKind;
        laboratories: Array<{
          shortName: string;
          referenceLaboratory: boolean;
          detectionAnalysis: boolean;
          confirmationAnalysis: boolean;
        }>;
      }
    >();

    for (const a of filtered) {
      const key = `${a.programmingPlanId}__${a.substanceKind}`;
      const existing = map.get(key);
      const labEntry = {
        shortName: a.laboratoryShortName,
        referenceLaboratory: a.referenceLaboratory,
        detectionAnalysis: a.detectionAnalysis,
        confirmationAnalysis: a.confirmationAnalysis
      };
      if (existing) {
        existing.laboratories.push(labEntry);
      } else {
        map.set(key, {
          programmingPlanId: a.programmingPlanId,
          programmingPlanKind: a.programmingPlanKind,
          programmingPlanYear: a.programmingPlanYear,
          substanceKind: a.substanceKind,
          laboratories: [labEntry]
        });
      }
    }

    return [...map.values()].sort(
      (a, b) =>
        b.programmingPlanYear - a.programmingPlanYear ||
        a.programmingPlanKind.localeCompare(b.programmingPlanKind) ||
        a.substanceKind.localeCompare(b.substanceKind)
    );
  }, [agreements, year]);

  const rowKey = (g: (typeof grouped)[number]) =>
    `${g.programmingPlanId}__${g.substanceKind}`;

  const allSelected =
    grouped.length > 0 && selectedRowKeys.length === grouped.length;

  const toggleRow = (key: string) =>
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleAll = () =>
    setSelectedRowKeys(allSelected ? [] : grouped.map(rowKey));

  const handleOpenModal = () => {
    setModalGroups(
      grouped
        .filter((g) => selectedRowKeys.includes(rowKey(g)))
        .map((g) => ({
          programmingPlanId: g.programmingPlanId,
          programmingPlanKind: g.programmingPlanKind,
          substanceKind: g.substanceKind
        }))
    );
    agreementsModal.open();
  };

  const handleOpenModalForRow = (g: (typeof grouped)[number]) => {
    setModalGroups([
      {
        programmingPlanId: g.programmingPlanId,
        programmingPlanKind: g.programmingPlanKind,
        substanceKind: g.substanceKind
      }
    ]);
    agreementsModal.open();
  };

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
            'Type de plan',
            'Substance',
            'Laboratoires agréés',
            ''
          ]}
          data={grouped.map((g) => [
            <div key={`select-${rowKey(g)}`} className="selectable-cell">
              <Checkbox
                options={[
                  {
                    label: '',
                    nativeInputProps: {
                      checked: selectedRowKeys.includes(rowKey(g)),
                      onChange: () => toggleRow(rowKey(g))
                    }
                  }
                ]}
                small
              />
            </div>,
            ProgrammingPlanKindLabels[
              g.programmingPlanKind as keyof typeof ProgrammingPlanKindLabels
            ],
            SubstanceKindLabels[
              g.substanceKind as keyof typeof SubstanceKindLabels
            ],
            <div
              key={`labs-${rowKey(g)}`}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}
            >
              {g.laboratories
                .filter(
                  (lab) =>
                    lab.referenceLaboratory ||
                    lab.detectionAnalysis ||
                    lab.confirmationAnalysis
                )
                .toSorted((a, b) => a.shortName.localeCompare(b.shortName))
                .map((lab) => (
                  <LaboratoryAgreementTag
                    key={lab.shortName}
                    shortName={lab.shortName as LaboratoryShortName}
                    referenceLaboratory={lab.referenceLaboratory}
                    detectionAnalysis={lab.detectionAnalysis}
                    confirmationAnalysis={lab.confirmationAnalysis}
                    onToggle={() => {}}
                  />
                ))}
            </div>,
            <Button
              key={`action-${rowKey(g)}`}
              iconId={
                g.laboratories.length === 0
                  ? 'fr-icon-add-line'
                  : 'fr-icon-edit-line'
              }
              priority="tertiary"
              size="medium"
              title={
                g.laboratories.length === 0
                  ? 'Affecter des laboratoires'
                  : 'Modifier les laboratoires'
              }
              onClick={() => handleOpenModalForRow(g)}
            />
          ])}
        />
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
