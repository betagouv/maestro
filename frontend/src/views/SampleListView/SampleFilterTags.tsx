import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Department, DepartmentLabels } from 'shared/referential/Department';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, Regions } from 'shared/referential/Region';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
} from 'shared/schema/Sample/SampleStatus';
import { UserInfos } from 'shared/schema/User/User';

interface Props {
  filters: FindSampleOptions;
  onChange: (filters: FindSampleOptions) => void;
  samplers?: UserInfos[];
  programmingPlans?: ProgrammingPlan[];
}

const SampleFilterTags = ({
  filters,
  onChange,
  samplers,
  programmingPlans,
}: Props) => {
  const sampler = useMemo(
    () => samplers?.find((user) => user.id === filters.sampledBy),
    [samplers, filters.sampledBy]
  );

  const programmingPlan = useMemo(
    () =>
      programmingPlans?.find((plan) => plan.id === filters.programmingPlanId),
    [programmingPlans, filters.programmingPlanId]
  );

  return (
    <>
      {filters.matrix && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ matrix: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {MatrixLabels[filters.matrix as Matrix]}
        </Tag>
      )}

      {filters.status && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ status: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {filters.status === DraftStatusList.join(',')
            ? 'Brouillon'
            : SampleStatusLabels[filters.status as SampleStatus]}
        </Tag>
      )}
      {sampler && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ sampledBy: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {sampler.firstName} {sampler.lastName}
        </Tag>
      )}
      {filters.sampledAt && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ sampledAt: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {format(new Date(filters.sampledAt as string), 'dd/MM/yyyy')}
        </Tag>
      )}
      {filters.region && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({ region: undefined, department: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {Regions[filters.region as Region].name}
        </Tag>
      )}
      {filters.department && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ department: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {DepartmentLabels[filters.department as Department]}
        </Tag>
      )}
      {programmingPlan && (
        <Tag
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ programmingPlanId: undefined }),
          }}
          className={cx('fr-mx-1w')}
        >
          {programmingPlan.title}
        </Tag>
      )}
    </>
  );
};

export default SampleFilterTags;
