import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';

interface Props {
  plans: ProgrammingPlanChecked[];
  programmedSubPlanCounts: Map<string, number>;
}

export const BulkPlanList = ({
  plans,
  programmedSubPlanCounts,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <ul>
      {plans.map((plan) => (
        <li key={plan.id}>
          {plan.title} (
          {pluralize(programmedSubPlanCounts.get(plan.id) ?? 0, {
            preserveCount: true
          })('sous-plan')}
          )
        </li>
      ))}
    </ul>
  );
};
