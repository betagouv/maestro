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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span
              className={cx(
                delta > 0
                  ? 'fr-icon-add-circle-fill'
                  : 'ri-indeterminate-circle-fill',
                'fr-icon--xs'
              )}
              style={{ lineHeight: 0 }}
              aria-hidden
            />
            {Math.abs(delta)}
          </span>
        </Badge>
      )}
    </>
  );
};

export default PrescriptionDistributionBadge;
