import Badge, { BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import {
  SampleStatus,
  SampleStatusLabels,
} from 'shared/schema/Sample/SampleStatus';

type Props = Omit<BadgeProps, 'children'> & {
  status: SampleStatus;
};

const SampleStatusBadge = ({ status, ...props }: Props) => {
  const label = SampleStatusLabels[status];

  const severity = {
    Draft: 'new',
    DraftMatrix: 'new',
    DraftItems: 'new',
    Submitted: 'info',
    Sent: 'success',
    NotAdmissible: 'error',
    Analysis: 'info',
    Completed: 'success',
  }[status];

  return (
    <Badge
      noIcon
      small
      {...props}
      severity={(severity || 'new') as AlertProps.Severity | 'new'}
    >
      {label || 'Nouveau'}
    </Badge>
  );
};

export default SampleStatusBadge;
