import Badge, { type BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import { isNil } from 'lodash-es';
import type { AnalysisStatus } from 'maestro-shared/schema/Analysis/AnalysisStatus';
import type {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import {
  type SampleStatus,
  SampleStatusLabels
} from 'maestro-shared/schema/Sample/SampleStatus';

type Props = Omit<BadgeProps, 'children'> & {
  sample: PartialSample | PartialSampleToCreate;
};

export const SampleStatusBadge = ({ sample, ...props }: Props) => {
  return (
    <StatusBadge
      status={sample.status}
      compliance={
        'compliance' in sample && !isNil(sample.compliance)
          ? sample.compliance === 'Compliant'
          : undefined
      }
      {...props}
    />
  );
};

type StatusBadgeProps = Omit<BadgeProps, 'children'> & {
  status: SampleStatus | AnalysisStatus;
  compliance?: boolean | null;
};

export const StatusBadge = ({
  status,
  compliance,
  ...props
}: StatusBadgeProps) => {
  const label = {
    ...SampleStatusLabels,
    Unused: 'Non utilisé'
  }[status];

  const Severity: Partial<
    Record<SampleStatus | AnalysisStatus, AlertProps.Severity>
  > = {
    NotAdmissible: 'error',
    Analysis: 'info',
    Completed:
      compliance === false ? 'error' : compliance === true ? 'success' : 'info',
    InReview: 'warning'
  };

  const ColorFamily: Partial<Record<SampleStatus | AnalysisStatus, string>> = {
    Submitted: 'yellow-tournesol',
    Sent: 'purple-glycine'
  };

  const Icon: Partial<Record<SampleStatus | AnalysisStatus, string>> = {
    Completed: 'success'
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
