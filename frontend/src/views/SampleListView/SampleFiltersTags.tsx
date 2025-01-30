import Tag from '@codegouvfr/react-dsfr/Tag';
import { format } from 'date-fns';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  RealizedStatusList,
  SampleStatus,
  SampleStatusLabels
} from 'maestro-shared/schema/Sample/SampleStatus';
import { User } from 'maestro-shared/schema/User/User';
import { useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
  samplers?: User[];
}

const SampleFiltersTags = ({ filters, onChange, samplers }: Props) => {
  const { hasNationalView } = useAuthentication();
  const sampler = useMemo(
    () => samplers?.find((user) => user.id === filters.sampledBy),
    [samplers, filters.sampledBy]
  );

  return (
    <>
      {filters.matrix && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ matrix: undefined })
          }}
        >
          {MatrixLabels[filters.matrix as Matrix]}
        </Tag>
      )}

      {filters.status && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ status: undefined })
          }}
        >
          {filters.status === DraftStatusList.join(',')
            ? 'Brouillon'
            : filters.status === RealizedStatusList.join(',')
              ? 'Réalisé'
              : SampleStatusLabels[filters.status as SampleStatus]}
        </Tag>
      )}
      {sampler && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ sampledBy: undefined })
          }}
        >
          {sampler.firstName} {sampler.lastName}
        </Tag>
      )}
      {filters.sampledAt && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ sampledAt: undefined })
          }}
        >
          {format(new Date(filters.sampledAt as string), 'dd/MM/yyyy')}
        </Tag>
      )}
      {hasNationalView && filters.region && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({ region: undefined, department: undefined })
          }}
        >
          {Regions[filters.region as Region].name}
        </Tag>
      )}
      {filters.department && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ department: undefined })
          }}
        >
          {DepartmentLabels[filters.department as Department]}
        </Tag>
      )}
      {filters.context && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ context: undefined })
          }}
        >
          {ContextLabels[filters.context]}
        </Tag>
      )}
    </>
  );
};

export default SampleFiltersTags;
