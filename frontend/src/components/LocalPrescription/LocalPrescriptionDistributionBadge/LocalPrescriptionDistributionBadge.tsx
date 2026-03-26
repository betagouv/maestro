import Badge from '@codegouvfr/react-dsfr/Badge';
import { sumBy } from 'lodash-es';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  localPrescription?: LocalPrescription;
  subLocalPrescriptions?: LocalPrescription[];
  small?: boolean;
}

const LocalPrescriptionDistributionBadge = ({
  localPrescription,
  subLocalPrescriptions,
  small
}: Props) => {
  if (!localPrescription) {
    return null;
  }

  return (
    <Badge
      noIcon
      small={small}
      severity={
        sumBy(subLocalPrescriptions, 'sampleCount') ===
        localPrescription.sampleCount
          ? 'success'
          : sumBy(subLocalPrescriptions, 'sampleCount') === 0
            ? 'error'
            : 'new'
      }
    >
      {pluralize(sumBy(subLocalPrescriptions, 'sampleCount'), {
        preserveCount: true
      })('attribué')}
    </Badge>
  );
};

export default LocalPrescriptionDistributionBadge;
