import Badge, { BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import {
  SampleStatus,
  SampleStatusLabels
} from 'maestro-shared/schema/Sample/SampleStatus';

type Props = Omit<BadgeProps, 'children'> & {
  status: SampleStatus;
};

const SampleStatusBadge = ({ status, ...props }: Props) => {
  const label = SampleStatusLabels[status];

  const Severity: Partial<Record<SampleStatus, AlertProps.Severity>> = {
    NotAdmissible: 'error',
    Analysis: 'info',
    Completed: 'success',
    CompletedNotConform: 'error'
  };

  const ColorFamily: Partial<Record<SampleStatus, string>> = {
    Submitted: 'yellow-tournesol',
    Sent: 'purple-glycine'
  };

  const Icon: Partial<Record<SampleStatus, string>> = {
    Completed: 'success',
    CompletedNotConform: 'error'
  };

  return (
    <Badge
      noIcon={Icon[status] === undefined}
      small
      {...props}
      severity={(Severity[status] ?? undefined) as AlertProps.Severity}
      className={cx({
        [`fr-badge--${ColorFamily[status]}`]: ColorFamily[status]
      })}
    >
      {label || 'Nouveau'}
    </Badge>
  );
};

export default SampleStatusBadge;
