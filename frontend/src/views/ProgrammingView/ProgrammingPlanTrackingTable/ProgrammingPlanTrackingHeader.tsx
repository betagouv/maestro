import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { ProgrammingPlanEchelon } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import { pluralize } from '../../../utils/stringUtils';
import './ProgrammingPlanTrackingHeader.scss';

interface Props {
  echelon: ProgrammingPlanEchelon;
  totalCount: number;
  finalizedCount: number;
  submittedCount: number;
  readyToSendCount: number;
}

const submittedLabelByEchelon: Record<
  Exclude<ProgrammingPlanEchelon, 'Departmental'>,
  string
> = {
  National: 'soumis aux régions',
  Regional: 'soumis aux départements'
};

const ProgrammingPlanTrackingHeader = ({
  echelon,
  totalCount,
  finalizedCount,
  submittedCount,
  readyToSendCount
}: Props) => (
  <div className={cx('fr-container', 'fr-px-5w', 'fr-mb-2w', 'fr-mb-md-3w')}>
    <h4 className={cx('fr-mb-1w')}>Suivi des plans</h4>
    <div
      className={clsx(
        'd-flex-align-center',
        'programming-plan-tracking-header-indicators'
      )}
    >
      <span>{pluralize(totalCount, { preserveCount: true })('plan')}</span>
      <div>
        <span
          className={cx(
            'fr-icon--sm',
            'fr-mr-1w',
            'fr-label--success',
            'fr-icon-checkbox-circle-line'
          )}
        />
        {pluralize(finalizedCount, { preserveCount: true })('finalisé')}
      </div>
      {echelon !== 'Departmental' && (
        <div>
          <span
            className={cx(
              'fr-icon--sm',
              'fr-mr-1w',
              'fr-label--success',
              'fr-icon-send-plane-line'
            )}
          />
          {submittedCount} {submittedLabelByEchelon[echelon]}
        </div>
      )}
      <div>
        <span
          className={cx(
            'fr-icon--sm',
            'fr-mr-1w',
            'fr-label--info',
            'fr-icon-time-line'
          )}
        />
        {readyToSendCount} à envoyer
      </div>
    </div>
  </div>
);

export default ProgrammingPlanTrackingHeader;
