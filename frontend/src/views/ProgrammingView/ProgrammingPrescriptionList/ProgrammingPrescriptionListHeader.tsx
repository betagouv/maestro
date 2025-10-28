import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy, uniq } from 'lodash-es';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import React, { useMemo, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionListGroupedUpdate from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionListGroupedUpdate';
import AddPrescriptionModal from '../../../components/Prescription/AddPrescriptionModal/AddPrescriptionModal';
import ProgrammingPlanNotificationDepartmentalToSampler from '../../../components/ProgrammingPlanNotification/ProgrammingPlanNotificationDepartmentalToSampler/ProgrammingPlanNotificationDepartmentalToSampler';
import ProgrammingPlanNotificationNationalToRegional from '../../../components/ProgrammingPlanNotification/ProgrammingPlanNotificationNationalToRegional/ProgrammingPlanNotificationNationalToRegional';
import ProgrammingPlanNotificationRegionalToDepartmental from '../../../components/ProgrammingPlanNotification/ProgrammingPlanNotificationRegionalToDepartmental/ProgrammingPlanNotificationRegionalToDepartmental';
import './ProgrammingPrescriptionList.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  localPrescriptions: LocalPrescription[];
  subLocalPrescriptions: LocalPrescription[];
  exportURL: string;
  hasGroupedUpdatePermission?: boolean;
  selectedCount?: number;
  onGroupedUpdate?: (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => Promise<void>;
  onSelectAll: () => void;
}

const ProgrammingPrescriptionListHeader = ({
  programmingPlan,
  prescriptions,
  localPrescriptions,
  subLocalPrescriptions,
  exportURL,
  hasGroupedUpdatePermission,
  selectedCount,
  onGroupedUpdate,
  onSelectAll
}: Props) => {
  const dispatch = useAppDispatch();
  const { isMobile } = useWindowSize();
  const {
    hasUserPrescriptionPermission,
    hasRegionalView,
    hasDepartmentalView
  } = useAuthentication();

  const { prescriptionListDisplay, prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const [isGroupedUpdate, setIsGroupedUpdate] = useState(false);

  const sampleCount = useMemo(
    () => sumBy(localPrescriptions, 'sampleCount'),
    [localPrescriptions]
  );
  return (
    <div
      className={cx(
        'fr-mb-2w',
        'fr-mb-md-5w',
        'fr-container',
        prescriptionListDisplay === 'table' ? 'fr-px-7w' : 'fr-px-0'
      )}
    >
      <div className="d-flex-align-center" style={{ gap: '1rem' }}>
        <h4 className={clsx(cx('fr-mb-0'), 'flex-grow-1')}>
          {t('plannedSample', { count: sampleCount ?? 0 })}
        </h4>
        <Input
          iconId="fr-icon-search-line"
          hideLabel
          label="Matrice"
          nativeInputProps={{
            type: 'search',
            placeholder: 'Matrice',
            value: prescriptionFilters.matrixQuery ?? '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              dispatch(
                prescriptionsSlice.actions.changePrescriptionFilters({
                  ...prescriptionFilters,
                  matrixQuery: e.target.value
                })
              );
            }
          }}
          className={cx('fr-my-0', 'fr-hidden', 'fr-unhidden-md')}
          classes={{
            wrap: cx('fr-mt-0')
          }}
        />
        {!isMobile && (
          <SegmentedControl
            hideLegend
            legend="Légende"
            segments={[
              {
                label: 'Grille',
                iconId: 'fr-icon-layout-grid-line',
                nativeInputProps: {
                  checked: prescriptionListDisplay === 'cards',
                  onChange: () => {
                    dispatch(
                      prescriptionsSlice.actions.changeListDisplay('cards')
                    );
                  },
                  'data-testid': 'prescriptions-cards-segment'
                } as any
              },
              {
                label: 'Tableau',
                iconId: 'fr-icon-table-line',
                nativeInputProps: {
                  checked: prescriptionListDisplay === 'table',
                  onChange: () => {
                    dispatch(
                      prescriptionsSlice.actions.changeListDisplay('table')
                    );
                  },
                  'data-testid': 'prescriptions-table-segment'
                } as any
              }
            ]}
          />
        )}
        <Button
          iconId="fr-icon-file-download-line"
          priority="secondary"
          onClick={() => window.open(exportURL)}
          title="Exporter"
          size={isMobile ? 'small' : 'medium'}
        />
        <ProgrammingPlanNotificationNationalToRegional
          programmingPlan={programmingPlan}
        />
        {hasRegionalView && (
          <ProgrammingPlanNotificationRegionalToDepartmental
            programmingPlan={programmingPlan}
            regionalPrescriptions={localPrescriptions}
            departmentalPrescriptions={subLocalPrescriptions}
          />
        )}
        {hasDepartmentalView && (
          <ProgrammingPlanNotificationDepartmentalToSampler
            programmingPlan={programmingPlan}
            departmentalPrescriptions={localPrescriptions}
            companyPrescriptions={subLocalPrescriptions}
          />
        )}
      </div>
      <hr className={cx('fr-my-3w')} />
      <div className="d-flex-align-center">
        <div className={clsx('flex-grow-1', 'd-flex-align-center')}>
          {hasUserPrescriptionPermission(programmingPlan)?.create && (
            <AddPrescriptionModal
              programmingPlan={programmingPlan}
              excludedMatrixKindList={uniq(
                prescriptions.map((p) => p.matrixKind)
              )}
            />
          )}
          {hasDepartmentalView && (
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
          {(hasDepartmentalView ||
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
            />
          )}
        </div>
        {hasGroupedUpdatePermission && !isGroupedUpdate && (
          <Button
            iconId="fr-icon-list-ordered"
            priority="secondary"
            title="Action groupée"
            children={isMobile ? undefined : 'Action groupée'}
            size={isMobile ? 'small' : 'medium'}
            onClick={() => setIsGroupedUpdate(true)}
          />
        )}
      </div>
      {isGroupedUpdate && onGroupedUpdate && (
        <ProgrammingPrescriptionListGroupedUpdate
          programmingPlan={programmingPlan}
          selectedCount={selectedCount ?? 0}
          totalCount={prescriptions.length}
          onSubmit={async (laboratoryId) => {
            await onGroupedUpdate(laboratoryId);
            setIsGroupedUpdate(false);
          }}
          onCancel={() => setIsGroupedUpdate(false)}
          onSelectAll={onSelectAll}
        />
      )}
    </div>
  );
};

export default ProgrammingPrescriptionListHeader;
