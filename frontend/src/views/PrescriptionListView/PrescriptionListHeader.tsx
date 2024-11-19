import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { FindPrescriptionOptions } from 'shared/schema/Prescription/FindPrescriptionOptions';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import MatrixSelectModal from 'src/components/MatrixSelectModal/MatrixSelectModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { getPrescriptionsExportURL } from 'src/services/prescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';

interface Props {
  programmingPlan: ProgrammingPlan;
  findPrescriptionOptions: FindPrescriptionOptions;
  prescriptions: Prescription[];
  addMatrix: (matrix: Matrix) => Promise<void>;
  sampleCount?: number;
}

const PrescriptionListHeader = ({
  programmingPlan,
  findPrescriptionOptions,
  prescriptions,
  addMatrix,
  sampleCount,
}: Props) => {
  const dispatch = useAppDispatch();
  const { isMobile } = useWindowSize();
  const { hasPermission } = useAuthentication();

  const { prescriptionListDisplay, matrixQuery } = useAppSelector(
    (state) => state.prescriptions
  );

  return (
    <>
      <div className={clsx('d-flex-align-center')}>
        <h4 className={cx('fr-mb-0', 'fr-mr-3w')}>
          {t('plannedSample', { count: sampleCount ?? 0 })}
        </h4>
        {hasPermission('createPrescription') &&
          programmingPlan.status === 'InProgress' && (
            <MatrixSelectModal
              excludedMatrixList={_.uniq(prescriptions.map((p) => p.matrix))}
              onSelect={addMatrix}
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
            },
          }}
          className={cx('fr-my-0', 'fr-hidden', 'fr-unhidden-md')}
        />
      </div>
      <div>
        {!isMobile && (
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
                  'data-testid': 'prescriptions-cards-segment',
                } as any,
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
                  'data-testid': 'prescriptions-table-segment',
                } as any,
              },
            ]}
            className={cx('fr-mr-3w')}
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
    </>
  );
};

export default PrescriptionListHeader;
