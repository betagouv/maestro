import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList } from 'shared/referential/Region';
import { Stage } from 'shared/referential/Stage';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'shared/schema/RegionalPrescription/RegionalPrescription';
import PrescriptionCardPartialTable from 'src/components/Prescription/PrescriptionCard/PrescriptionCardPartialTable';
import PrescriptionNotes from 'src/components/Prescription/PrescriptionNote/PrescriptionNotes';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import PrescriptionSubstancesModalButtons from 'src/components/Prescription/PrescriptionSubstancesModal/PrescriptionSubstancesModalButtons';
import { useAuthentication } from 'src/hooks/useAuthentication';
import RemoveMatrix from 'src/views/PrescriptionListView/RemoveMatrix';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (
    prescriptionId: string,
    region: Region,
    value: number
  ) => void;
  onRemovePrescription: (prescriptionId: string) => Promise<void>;
  onChangePrescriptionStages: (
    prescriptionId: string,
    stages: Stage[]
  ) => Promise<void>;
  onChangePrescriptionNotes: (
    prescriptionId: string,
    note: string
  ) => Promise<void>;
}

const PrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount,
  onRemovePrescription: removeMatrix,
  onChangePrescriptionStages,
  onChangePrescriptionNotes
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  return (
    <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
      <div className={cx('fr-card__body')}>
        <div className={cx('fr-card__content')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-md-5')}>
              <h3 className={cx('fr-card__title')}>
                {MatrixLabels[prescription.matrix]}
              </h3>
              <hr className={cx('fr-mt-2w', 'fr-mb-3w')} />
              <Tabs
                tabs={[
                  {
                    label: 'Analyses',
                    content: (
                      <PrescriptionSubstancesModalButtons
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                      />
                    )
                  },
                  {
                    iconId:
                      prescription.stages.length > 0
                        ? 'fr-icon-check-line'
                        : undefined,
                    label: 'Stades',
                    content: (
                      <PrescriptionStages
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        label="Stades de prélèvement"
                        onChangeStages={(stages) =>
                          onChangePrescriptionStages(prescription.id, stages)
                        }
                      />
                    )
                  },
                  {
                    iconId:
                      (prescription.notes ?? '').length > 0
                        ? 'fr-icon-quote-line'
                        : undefined,
                    label: 'Note',
                    content: (
                      <PrescriptionNotes
                        programmingPlan={programmingPlan}
                        value={prescription.notes ?? ''}
                        onSubmitNotes={(note) =>
                          onChangePrescriptionNotes(prescription.id, note)
                        }
                      />
                    )
                  }
                ]}
                classes={{
                  panel: 'fr-p-3w'
                }}
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-md-7')}>
              <div className={clsx(cx('fr-mb-3w'), 'd-flex-align-center')}>
                <span className="flex-grow-1">
                  {t('plannedSample', {
                    count: _.sumBy(regionalPrescriptions, 'sampleCount')
                  })}
                </span>
                {hasUserPrescriptionPermission(programmingPlan)?.delete && (
                  <RemoveMatrix
                    matrix={prescription.matrix}
                    stages={prescription.stages}
                    onRemove={() => removeMatrix(prescription.id)}
                  />
                )}
              </div>
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalPrescriptionCount={
                  onChangeRegionalPrescriptionCount
                }
                start={0}
                end={RegionList.length / 2}
              />
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalPrescriptionCount={
                  onChangeRegionalPrescriptionCount
                }
                start={RegionList.length / 2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
