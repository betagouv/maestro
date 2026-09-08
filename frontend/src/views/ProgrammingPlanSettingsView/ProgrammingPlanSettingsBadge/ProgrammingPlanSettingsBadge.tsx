import Badge from '@codegouvfr/react-dsfr/Badge';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { assert, type Equals } from 'tsafe';

type Props = {
  programmingPlans: ProgrammingPlanChecked[];
  small?: boolean;
};

const hasSettingsCompleted = (plan: ProgrammingPlanChecked): boolean =>
  plan.settingsCompleted &&
  plan.subPlans.every(({ settingsCompleted }) => settingsCompleted);

export const ProgrammingPlanSettingsBadge = ({
  programmingPlans,
  small,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const areSettingsCompleted =
    programmingPlans.length > 0 && programmingPlans.every(hasSettingsCompleted);

  return (
    <Badge
      small={small}
      severity={areSettingsCompleted ? 'success' : 'warning'}
    >
      {areSettingsCompleted ? 'Terminé' : 'En cours'}
    </Badge>
  );
};
