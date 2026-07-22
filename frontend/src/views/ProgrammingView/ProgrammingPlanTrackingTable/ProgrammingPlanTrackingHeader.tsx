import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { pluralize } from '../../../utils/stringUtils';

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
      className="d-flex-align-center"
      style={{ gap: '1.5rem', flexWrap: 'wrap' }}
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
