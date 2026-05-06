import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext, useMemo, useState } from 'react';
import microscope from 'src/assets/illustrations/microscope.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import LaboratoryAgreementsModal, {
  type AgreementsGroup
} from './LaboratoryAgreementsModal';

const agreementsModal = createModal({
  id: 'laboratory-agreements-modal',
  isOpenedByDefault: false
});

const LaboratoryAgreementsView = () => {
  useDocumentTitle('Agréments laboratoires');
  const apiClient = useContext(ApiClientContext);

  const [search, setSearch] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [selectedGroup, setSelectedGroup] = useState<AgreementsGroup | null>(
    null
  );

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
    const matchSearch = (a: (typeof agreements)[number]) =>
      !search ||
      a.laboratoryName.toLowerCase().includes(search.toLowerCase().trim()) ||
      a.laboratoryShortName.toLowerCase().includes(search.toLowerCase().trim());

    const filtered = agreements.filter(
      (a) => matchSearch(a) && (!year || String(a.programmingPlanYear) === year)
    );

    const map = new Map<
      string,
      {
        programmingPlanId: string;
        programmingPlanKind: string;
        programmingPlanYear: number;
        substanceKind: string;
        laboratories: string[];
      }
    >();

    for (const a of filtered) {
      const key = `${a.programmingPlanId}__${a.substanceKind}`;
      const existing = map.get(key);
      if (existing) {
        existing.laboratories.push(a.laboratoryShortName);
      } else {
        map.set(key, {
          programmingPlanId: a.programmingPlanId,
          programmingPlanKind: a.programmingPlanKind,
          programmingPlanYear: a.programmingPlanYear,
          substanceKind: a.substanceKind,
          laboratories: [a.laboratoryShortName]
        });
      }
    }

    return [...map.values()].sort(
      (a, b) =>
        b.programmingPlanYear - a.programmingPlanYear ||
        a.programmingPlanKind.localeCompare(b.programmingPlanKind) ||
        a.substanceKind.localeCompare(b.substanceKind)
    );
  }, [agreements, search, year]);

  const handleOpenModal = (g: (typeof grouped)[number]) => {
    setSelectedGroup({
      programmingPlanId: g.programmingPlanId,
      programmingPlanKind: g.programmingPlanKind,
      substanceKind: g.substanceKind
    });
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
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}>
          <div className={cx('fr-col-12', 'fr-col-md-6')}>
            <SearchBar
              label="Rechercher un laboratoire"
              defaultValue={search}
              onButtonClick={(value) => setSearch(value)}
            />
          </div>
        </div>
        <Table
          noCaption
          headers={['Type de plan', 'Substance', 'Laboratoires agréés']}
          data={grouped.map((g) => [
            ProgrammingPlanKindLabels[
              g.programmingPlanKind as keyof typeof ProgrammingPlanKindLabels
            ],
            SubstanceKindLabels[
              g.substanceKind as keyof typeof SubstanceKindLabels
            ],
            <Button
              key={g.programmingPlanId + g.substanceKind}
              iconId="fr-icon-add-line"
              priority="tertiary"
              size="small"
              title="Affecter les laboratoires"
              onClick={() => handleOpenModal(g)}
            ></Button>
          ])}
        />
      </div>
      <LaboratoryAgreementsModal
        modal={agreementsModal}
        selectedGroup={selectedGroup}
        agreements={agreements}
        laboratories={laboratories}
        onSave={(input) => updateAgreements(input).unwrap()}
      />
    </section>
  );
};

export default LaboratoryAgreementsView;
