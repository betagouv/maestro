import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { t } from 'i18next';
import { uniq } from 'lodash-es';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import React from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionListGroupedUpdate from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionListGroupedUpdate';
import AddPrescriptionModal from '../../../components/Prescription/AddPrescriptionModal/AddPrescriptionModal';
import ProgrammingPlanNationalValidation from '../../../components/ProgrammingPlan/ProgrammingPlanNationalValidation/ProgrammingPlanNationalValidation';
import './ProgrammingPrescriptionList.scss';
interface Props {
  programmingPlans: ProgrammingPlan[];
  prescriptions: Prescription[];
  exportURL: string;
  sampleCount?: number;
  hasGroupedUpdatePermission?: boolean;
  selectedCount?: number;
  onGroupedUpdate?: (laboratoryId?: string) => Promise<void>;
  onSelectAll: () => void;
}

const ProgrammingPrescriptionListHeader = ({
  programmingPlans,
  prescriptions,
  exportURL,
  sampleCount,
  hasGroupedUpdatePermission,
  selectedCount,
  onGroupedUpdate,
  onSelectAll
}: Props) => {
  const dispatch = useAppDispatch();
  const { isMobile } = useWindowSize();
  const { hasUserPrescriptionPermission, hasNationalView } =
    useAuthentication();

  const { prescriptionListDisplay, matrixQuery } = useAppSelector(
    (state) => state.prescriptions
  );

  const [isGroupedUpdate, setIsGroupedUpdate] = React.useState(false);

  return (
    <div className={cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container')}>
      <div className="d-flex-align-center" style={{ gap: '1rem' }}>
        <h4 className={clsx(cx('fr-mb-0'), 'flex-grow-1')}>
          {t('plannedSample', { count: sampleCount ?? 0 })}
        </h4>
        {programmingPlans
          ?.flatMap((plan) => plan.regionalStatus)
          .some(
            (regionalStatus) =>
              NextProgrammingPlanStatus[regionalStatus.status] &&
              ['Submitted', 'Validated'].includes(
                NextProgrammingPlanStatus[
                  regionalStatus.status
                ] as ProgrammingPlanStatus
              )
          ) && (
          <ProgrammingPlanNationalValidation
            programmingPlans={programmingPlans}
          />
        )}
        {!isMobile && hasNationalView && (
          <SegmentedControl
            hideLegend
            legend="Légende"
            segments={[
              {
                label: 'Cartes',
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
        {hasGroupedUpdatePermission && (
          <Button
            iconId="fr-icon-list-ordered"
            priority="secondary"
            title="Action groupée"
            children={isMobile ? undefined : 'Action groupée'}
            size={isMobile ? 'small' : 'medium'}
            className={cx('fr-mr-2w')}
            onClick={() => setIsGroupedUpdate(true)}
          />
        )}
        <Button
          iconId="fr-icon-file-download-line"
          priority="secondary"
          onClick={() => window.open(exportURL)}
          title="Exporter"
          size={isMobile ? 'small' : 'medium'}
        />
      </div>
      {isGroupedUpdate && onGroupedUpdate && (
        <ProgrammingPrescriptionListGroupedUpdate
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
      <hr className={cx('fr-my-3w')} />
      <div className="d-flex-align-center">
        <div className="flex-grow-1">
          {programmingPlans.some(
            (programmingPlan) =>
              hasUserPrescriptionPermission(programmingPlan)?.create
          ) && (
            <AddPrescriptionModal
              programmingPlans={programmingPlans}
              excludedMatrixKindList={uniq(
                prescriptions.map((p) => p.matrixKind)
              )}
            />
          )}
        </div>
        <Input
          iconId="fr-icon-search-line"
          hideLabel
          label="Matrice"
          nativeInputProps={{
            type: 'search',
            placeholder: 'Matrice',
            value: matrixQuery ?? '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              dispatch(
                prescriptionsSlice.actions.changeMatrixQuery(e.target.value)
              );
            }
          }}
          className={cx('fr-my-0', 'fr-hidden', 'fr-unhidden-md')}
        />
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionListHeader;
