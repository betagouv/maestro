import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import PrescriptionCommentsModalButton from 'src/components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModalButton';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
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
        data-testid={`card-${prescription.matrixKind}`}
      >
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            <h3 className={clsx(cx('fr-card__title'), 'd-flex-align-center')}>
              <div className="flex-grow-1">
                {MatrixKindLabels[prescription.matrixKind]}
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
                  <PrescriptionCommentsModalButton
                    matrixKind={prescription.matrixKind}
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
                  programmingPlan.regionalStatus.find(
                    (_) => _.region === regionalPrescription.region
                  )?.status as ProgrammingPlanStatus
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
