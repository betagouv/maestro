import Badge from '@codegouvfr/react-dsfr/Badge';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { assert, type Equals } from 'tsafe';

type Props = {
  programmingPlans: ProgrammingPlanChecked[];
  small?: boolean;
};

//FIXME temporaire, à terme on souhaite savoir si le PARAMÉTRAGE de tous les plans/sous-plans est terminé ou non
const hasSettingsInProgress = (plan: ProgrammingPlanChecked): boolean =>
  [...plan.regionalStatus, ...plan.departmentalStatus].some(
    ({ status }) => status === 'InProgress'
  );

export const ProgrammingPlanSettingsBadge = ({
  programmingPlans,
  small,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const areSettingsCompleted =
    programmingPlans.length > 0 &&
    !programmingPlans.some(hasSettingsInProgress);

  return (
    <Badge
      small={small}
      severity={areSettingsCompleted ? 'success' : 'warning'}
    >
      {areSettingsCompleted ? 'Terminé' : 'En cours'}
    </Badge>
  );
};
