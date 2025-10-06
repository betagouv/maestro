import Badge from '@codegouvfr/react-dsfr/Badge';
import { Region } from 'maestro-shared/referential/Region';
import {
  getCompletionRate,
  LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';

interface Props {
  localPrescriptions: LocalPrescription | LocalPrescription[];
  region?: Region;
}

const CompletionBadge = ({ localPrescriptions, region }: Props) => {
  return (
    <Badge
      noIcon
      severity={
        getCompletionRate(localPrescriptions, region) === 100
          ? 'success'
          : getCompletionRate(localPrescriptions, region) > 50
            ? 'warning'
            : 'error'
      }
      className={'fr-px-1v'}
    >
      {getCompletionRate(localPrescriptions, region)}%
    </Badge>
  );
};

export default CompletionBadge;
