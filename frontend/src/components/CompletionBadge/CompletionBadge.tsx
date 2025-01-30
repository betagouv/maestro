import Badge from '@codegouvfr/react-dsfr/Badge';
import { Region } from 'maestro-shared/referential/Region';
import {
  getCompletionRate,
  RegionalPrescription
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';

interface Props {
  regionalPrescriptions: RegionalPrescription | RegionalPrescription[];
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
