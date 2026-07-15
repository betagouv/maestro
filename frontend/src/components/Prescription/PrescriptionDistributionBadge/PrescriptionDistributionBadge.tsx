import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

interface Props {
  sampleCount: number;
  distributedCount: number;
  small?: boolean;
}

const PrescriptionDistributionBadge = ({
  sampleCount,
  distributedCount,
  small
}: Props) => {
  const delta = distributedCount - sampleCount;

  return (
    <>
      {delta === 0 ? (
        <Badge severity="success" small={small}>
          {distributedCount}
        </Badge>
      ) : (
        <Badge severity="error" small={small} noIcon>
          <span
            className={cx(
              delta > 0 ? 'fr-icon-add-line' : 'fr-icon-subtract-line',
              'fr-icon--xs'
            )}
          />
          {Math.abs(delta)}
        </Badge>
      )}
    </>
  );
};

export default PrescriptionDistributionBadge;
