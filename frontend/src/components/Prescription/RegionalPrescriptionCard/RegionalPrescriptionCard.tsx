import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'shared/schema/RegionalPrescription/RegionalPrescription';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import RegionalPrescriptionCommentsModalButton from 'src/components/Prescription/RegionalPrescriptionCommentsModal/RegionalPrescriptionCommentsModalButton';
import RegionalPrescriptionLaboratory from 'src/components/Prescription/RegionalPrescriptionLaboratory/RegionalPrescriptionLaboratory';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import './RegionalPrescriptionCard.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription?: RegionalPrescription;
  onChangeLaboratory: (laboratoryId: string) => Promise<void>;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const RegionalPrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  onChangeLaboratory,
  isSelected,
  onToggleSelection
}: Props) => {
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  if (!regionalPrescription) {
    return <></>;
  }

  return (
    <div className={cx('fr-col-12', 'fr-col-md-4')}>
      <div
        className={clsx(
          cx('fr-card', 'fr-card--sm'),
          'regional-prescription-card'
        )}
      >
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            <h3 className={clsx(cx('fr-card__title'), 'd-flex-align-center')}>
              <div className="flex-grow-1">
                {MatrixLabels[prescription.matrix]}
              </div>
              {hasUserRegionalPrescriptionPermission(
                programmingPlan,
                regionalPrescription
              )?.updateLaboratory && (
                <Checkbox
                  options={[
                    {
                      label: '',
                      nativeInputProps: {
                        checked: isSelected,
                        onChange: onToggleSelection
                      }
                    }
                  ]}
                  classes={{
                    content: 'fr-mt-1v'
                  }}
                />
              )}
            </h3>
            {prescription.notes && (
              <div className={cx('fr-mt-1v')}>
                <span className={cx('fr-icon-quote-line', 'fr-mr-1w')}></span>
                <i>{prescription.notes}</i>
              </div>
            )}
            <div className={cx('fr-card__desc')}>
              <PrescriptionStages
                programmingPlan={programmingPlan}
                prescription={prescription}
                label={`${pluralize(prescription.stages.length)('Stade')} de prélèvement`}
              />
            </div>
            <div className="fr-card__end">
              {hasUserRegionalPrescriptionPermission(
                programmingPlan,
                regionalPrescription
              )?.comment && (
                <div className="fr-card__end">
                  <RegionalPrescriptionCommentsModalButton
                    regionalPrescription={regionalPrescription}
                  />
                </div>
              )}
              {hasUserRegionalPrescriptionPermission(
                programmingPlan,
                regionalPrescription
              )?.updateLaboratory && (
                <RegionalPrescriptionLaboratory
                  regionalPrescription={regionalPrescription}
                  onChangeLaboratory={onChangeLaboratory}
                />
              )}
              <hr className={cx('fr-my-2w')} />
              <div>
                {['InProgress', 'Submitted'].includes(
                  programmingPlan.status
                ) ? (
                  <span className={cx('fr-text--bold')}>
                    {regionalPrescription.sampleCount ?? 0}{' '}
                    {pluralize(regionalPrescription.sampleCount ?? 0)(
                      'prélèvement programmé'
                    )}
                  </span>
                ) : (
                  <>
                    <span className={cx('fr-text--bold')}>
                      {regionalPrescription.realizedSampleCount ?? 0}{' '}
                      {pluralize(regionalPrescription.realizedSampleCount ?? 0)(
                        'prélèvement'
                      )}
                    </span>
                    {' sur '}
                    {regionalPrescription.sampleCount ?? 0}{' '}
                    {pluralize(regionalPrescription.sampleCount ?? 0)(
                      'programmé'
                    )}
                    {' • '}
                    <CompletionBadge
                      regionalPrescriptions={regionalPrescription}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalPrescriptionCard;
