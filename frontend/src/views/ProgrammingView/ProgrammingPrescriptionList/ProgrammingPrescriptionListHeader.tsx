import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { t } from 'i18next';
import type { PrescriptionCounts } from 'maestro-shared/schema/Prescription/PrescriptionCounts';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

import type { ReactNode } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import './ProgrammingPrescriptionList.scss';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  counts?: PrescriptionCounts;
  exportURL: string;
  onImport?: () => void;
}

type ToggleFilterKey =
  | 'missingDistribution'
  | 'missingLaboratory'
  | 'withNovelty';

const ProgrammingPrescriptionListHeader = ({
  programmingPlan,
  counts,
  exportURL,
  onImport
}: Props) => {
  const dispatch = useAppDispatch();
  const { isMobile } = useWindowSize();
  const { hasRegionalView, hasDepartmentalView, hasUserPermission } =
    useAuthentication();

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const missingDistributionCount = counts?.missingDistributionCount ?? 0;

  const filterToggle = (
    key: ToggleFilterKey,
    label: string,
    inputTitle: string,
    count: number,
    testId?: string
  ): ReactNode => {
    const checked = prescriptionFilters[key] ?? false;
    return (
      <ToggleSwitch
        label={<span className="no-wrap">{`${label} (${count})`}</span>}
        inputTitle={inputTitle}
        checked={checked}
        disabled={count === 0 && !checked}
        onChange={(isChecked) =>
          dispatch(
            prescriptionsSlice.actions.changePrescriptionFilters({
              ...prescriptionFilters,
              [key]: isChecked
            })
          )
        }
        showCheckedHint={false}
        data-testid={testId}
      />
    );
  };

  return (
    <div
      className={clsx(
        cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-container', 'fr-px-5w'),
        'prescription-list-header'
      )}
    >
      <div className="flex-grow-1">
        <h4 className={cx('fr-mb-1v')}>
          {`${t('subPlan', { count: counts?.subPlanCount ?? 0 })} (${t(
            'sample',
            { count: counts?.sampleCount ?? 0 }
          )})`}
        </h4>
        <Badge
          small
          severity={missingDistributionCount > 0 ? 'warning' : 'success'}
        >
          {missingDistributionCount > 0
            ? `${missingDistributionCount} à répartir`
            : `${counts?.distributedCount ?? 0} répartis`}
        </Badge>
      </div>
      <div className="prescription-list-header__filters">
        {filterToggle(
          'missingDistribution',
          'Répartition à réaliser',
          'Filtrer les sous-plans avec répartition à réaliser',
          missingDistributionCount
        )}
        {hasUserPermission('updatePrescriptionLaboratories') &&
          (hasDepartmentalView ||
            (hasRegionalView &&
              programmingPlan.distributionKind === 'REGIONAL')) &&
          filterToggle(
            'missingLaboratory',
            'Laboratoires à attribuer',
            'Filtrer les sous-plans avec laboratoire à attribuer',
            counts?.missingLaboratoryCount ?? 0,
            'missing-laboratory-toggle'
          )}
        {filterToggle(
          'withNovelty',
          'Nouveautés',
          'Filtrer les sous-plans présentant des nouveautés',
          counts?.noveltyCount ?? 0
        )}
      </div>
      <Button
        iconId="fr-icon-file-download-line"
        priority="secondary"
        onClick={() => window.open(exportURL)}
        title="Exporter"
        size={isMobile ? 'small' : 'medium'}
      >
        Exporter
      </Button>
      {onImport && (
        <Button
          iconId="fr-icon-upload-line"
          priority="secondary"
          onClick={onImport}
          title="Importer"
          size={isMobile ? 'small' : 'medium'}
        >
          Importer
        </Button>
      )}
    </div>
  );
};

export default ProgrammingPrescriptionListHeader;
