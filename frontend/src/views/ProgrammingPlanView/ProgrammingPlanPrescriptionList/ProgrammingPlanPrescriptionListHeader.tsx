import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import React from 'react';
import MatrixSelectModal from 'src/components/MatrixSelectModal/MatrixSelectModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { getPrescriptionsExportURL } from 'src/services/prescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPlanPrescriptionListGroupedUpdate from 'src/views/ProgrammingPlanView/ProgrammingPlanPrescriptionList/ProgrammingPlanPrescriptionListGroupedUpdate';
import './ProgrammingPlanPrescriptionList.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  findPrescriptionOptions: FindPrescriptionOptions;
  prescriptions: Prescription[];
  addMatrixKind: (matrixKind: MatrixKind) => Promise<void>;
  sampleCount?: number;
  hasGroupedUpdatePermission?: boolean;
  selectedCount?: number;
  onGroupedUpdate?: (laboratoryId?: string) => Promise<void>;
  onSelectAll: () => void;
}

const ProgrammingPlanPrescriptionListHeader = ({
  programmingPlan,
  findPrescriptionOptions,
  prescriptions,
  addMatrixKind,
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
    <>
      <div className={clsx('d-flex-align-center')}>
        <h4 className={cx('fr-mb-0', 'fr-mr-3w')}>
          {t('plannedSample', { count: sampleCount ?? 0 })}
        </h4>
        {hasUserPrescriptionPermission(programmingPlan)?.create && (
          <MatrixSelectModal
            excludedMatrixKindList={_.uniq(
              prescriptions.map((p) => p.matrixKind)
            )}
            onSelect={addMatrixKind}
          />
        )}
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
      <div>
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
            className={cx('fr-mr-3w')}
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
          onClick={() =>
            window.open(getPrescriptionsExportURL(findPrescriptionOptions))
          }
          title="Exporter"
          children={isMobile ? undefined : 'Exporter'}
          size={isMobile ? 'small' : 'medium'}
        />
      </div>
      {isGroupedUpdate && onGroupedUpdate && (
        <ProgrammingPlanPrescriptionListGroupedUpdate
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
    </>
  );
};

export default ProgrammingPlanPrescriptionListHeader;
