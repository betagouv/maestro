import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { sumBy } from 'lodash-es';
import type { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';

type Props = {
  domain: ProgrammingPlanDomain;
  programmingPlans: ProgrammingPlanChecked[];
};

export const DomainCard = ({ domain, programmingPlans, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const subPlanCount = sumBy(programmingPlans, (plan) => plan.subPlans.length);

  return (
    <Card
      title={domain.label}
      titleAs="h6"
      desc={
        <span className={cx('fr-text--xs', 'fr-mb-0')}>
          <span className="icon-text ">
            <span className={cx('fr-icon-folder-2-line', 'fr-icon--sm')}></span>
            {pluralize(programmingPlans.length, { preserveCount: true })(
              'plan'
            )}
            {' / '}
            {pluralize(subPlanCount, { preserveCount: true })('sous-plan')}
          </span>
        </span>
      }
    />
  );
};
