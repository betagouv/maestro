import Badge from '@codegouvfr/react-dsfr/Badge';
import { Region } from 'maestro-shared/referential/Region';
import {
  getCompletionRate,
  LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';

interface Props {
  regionalPrescriptions: LocalPrescription | LocalPrescription[];
  region?: Region;
}

const CompletionBadge = ({ regionalPrescriptions, region }: Props) => {
  return (
    <Badge
      noIcon
      severity={
        getCompletionRate(regionalPrescriptions, region) === 100
          ? 'success'
          : getCompletionRate(regionalPrescriptions, region) > 50
            ? 'warning'
            : 'error'
      }
      className={'fr-px-1v'}
    >
      {getCompletionRate(regionalPrescriptions, region)}%
    </Badge>
  );
};

export default CompletionBadge;
