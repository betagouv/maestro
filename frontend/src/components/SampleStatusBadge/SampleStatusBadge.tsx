import Badge, { BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import {
  SampleStatus,
  SampleStatusLabels
} from 'maestro-shared/schema/Sample/SampleStatus';
import { useContext, useEffect, useState } from 'react';
import { ApiClientContext } from '../../services/apiClient';

type Props = Omit<BadgeProps, 'children'> & {
  status: SampleStatus;
  sampleId: string;
};

export const SampleStatusBadge = ({ status, sampleId, ...props }: Props) => {
  const apiClient = useContext(ApiClientContext);

  const [getAnalysis] = apiClient.useLazyGetSampleItemAnalysisQuery();

  const [compliance, setCompliance] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'Completed') {
      getAnalysis({ sampleId, itemNumber: 1, copyNumber: 1 }) //TODO à gérer
        .unwrap()
        .then((analysis) => {
          setCompliance(analysis?.compliance ?? null);
        });
    }
    return setCompliance(null);
  }, [sampleId, status]); // eslint-disable-line react-hooks/exhaustive-deps

  return <StatusBadge status={status} compliance={compliance} {...props} />;
};

type StatusBadgeProps = Omit<BadgeProps, 'children'> & {
  status: SampleStatus;
  compliance: boolean | null;
};

const StatusBadge = ({ status, compliance, ...props }: StatusBadgeProps) => {
  const label = SampleStatusLabels[status];

  const Severity: Partial<Record<SampleStatus, AlertProps.Severity>> = {
    NotAdmissible: 'error',
    Analysis: 'info',
    Completed: compliance === false ? 'error' : 'success',
    InReview: 'warning'
  };

  const ColorFamily: Partial<Record<SampleStatus, string>> = {
    Submitted: 'yellow-tournesol',
    Sent: 'purple-glycine'
  };

  const Icon: Partial<Record<SampleStatus, string>> = {
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
