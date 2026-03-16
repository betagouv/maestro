import Badge, { BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import { AnalysisStatus } from 'maestro-shared/schema/Analysis/AnalysisStatus';
import {
  PartialSample,
  PartialSampleToCreate,
  SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import { SampleCompliance } from 'maestro-shared/schema/Sample/SampleCompliance';
import {
  SampleStatus,
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
        SampleChecked.safeParse(sample).success
          ? (sample as SampleChecked).compliance
          : undefined
      }
      {...props}
    />
  );
};

type StatusBadgeProps = Omit<BadgeProps, 'children'> & {
  status: SampleStatus | AnalysisStatus;
  compliance?: SampleCompliance | null;
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
    Completed: compliance === 'NonCompliant' ? 'error' : 'success',
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
