import Badge from '@codegouvfr/react-dsfr/Badge';
import { sumBy } from 'lodash-es';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  localPrescription?: LocalPrescription;
  subLocalPrescriptions?: LocalPrescription[];
}

const LocalPrescriptionDistributionBadge = ({
  localPrescription,
  subLocalPrescriptions
}: Props) => {
  if (!localPrescription) {
    return <></>;
  }

  return (
    <Badge
      noIcon
      small
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
