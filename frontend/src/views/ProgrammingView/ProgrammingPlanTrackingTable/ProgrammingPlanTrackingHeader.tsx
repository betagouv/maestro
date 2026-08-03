import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { pluralize } from '../../../utils/stringUtils';
import './ProgrammingPlanTrackingHeader.scss';

interface Props {
  totalCount: number;
  finalizedCount: number;
  submittedCount: number;
  readyToSendCount: number;
}

const ProgrammingPlanTrackingHeader = ({
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
      <span>
        {pluralize(finalizedCount, { preserveCount: true })('finalisé')}
      </span>
      <span>{submittedCount} soumis aux régions</span>
      <span>{readyToSendCount} à envoyer</span>
    </div>
  </div>
);

export default ProgrammingPlanTrackingHeader;
