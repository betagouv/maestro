import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPlanNotificationRegionalToDepartmental from '../../../components/ProgrammingPlanNotification/ProgrammingPlanNotificationRegionalToDepartmental/ProgrammingPlanNotificationRegionalToDepartmental';
import './ProgrammingPrescriptionList.scss';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  prescriptions: Prescription[];
  localPrescriptions: LocalPrescription[];
  subLocalPrescriptions: LocalPrescription[];
  exportURL: string;
}

const ProgrammingPrescriptionListHeader = ({
  programmingPlan,
  prescriptions,
  localPrescriptions,
  subLocalPrescriptions,
  exportURL
}: Props) => {
  const dispatch = useAppDispatch();
  const { isMobile } = useWindowSize();
  const { hasRegionalView, hasDepartmentalView, hasUserPermission } =
    useAuthentication();

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const sampleCount = useMemo(
    () => sumBy(prescriptions, 'sampleCount'),
    [prescriptions]
  );
  return (
    <div className={cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-container', 'fr-px-5w')}>
      <div className="d-flex-align-center" style={{ gap: '1rem' }}>
        <h4 className={clsx(cx('fr-mb-0'), 'flex-grow-1')}>
          {t('plannedSample', { count: sampleCount ?? 0 })}
        </h4>
        <Button
          iconId="fr-icon-file-download-line"
          priority="secondary"
          onClick={() => window.open(exportURL)}
          title="Exporter"
          size={isMobile ? 'small' : 'medium'}
        />
        {hasRegionalView &&
          programmingPlan.distributionKind === 'SLAUGHTERHOUSE' && (
            <ProgrammingPlanNotificationRegionalToDepartmental
              programmingPlan={programmingPlan}
              regionalPrescriptions={localPrescriptions}
              departmentalPrescriptions={subLocalPrescriptions}
            />
          )}
      </div>
      <div className="d-flex-align-center">
        <div className={clsx('flex-grow-1', 'd-flex-align-center')}>
          {hasUserPermission('distributePrescriptionToSlaughterhouses') && (
            <ToggleSwitch
              label={<span className="no-wrap">Répartition à réaliser</span>}
              inputTitle="Filtrer les prélèvements avec répartition à réaliser"
              checked={prescriptionFilters.missingSlaughterhouse ?? false}
              onChange={(checked) => {
                dispatch(
                  prescriptionsSlice.actions.changePrescriptionFilters({
                    ...prescriptionFilters,
                    missingSlaughterhouse: checked
                  })
                );
              }}
              showCheckedHint={false}
            />
          )}
          {hasUserPermission('updatePrescriptionLaboratories') &&
            (hasDepartmentalView ||
              (hasRegionalView &&
                programmingPlan.distributionKind === 'REGIONAL')) && (
              <ToggleSwitch
                label={<span className="no-wrap">Laboratoire à attribuer</span>}
                inputTitle="Filtrer les prélèvements avec laboratoire à attribuer"
                checked={prescriptionFilters.missingLaboratory ?? false}
                onChange={(checked) => {
                  dispatch(
                    prescriptionsSlice.actions.changePrescriptionFilters({
                      ...prescriptionFilters,
                      missingLaboratory: checked
                    })
                  );
                }}
                showCheckedHint={false}
                data-testid="missing-laboratory-toggle"
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionListHeader;
