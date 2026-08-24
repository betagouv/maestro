import Button from '@codegouvfr/react-dsfr/Button';
import clsx from 'clsx';
import { assert, type Equals } from 'tsafe';
import './ProgrammingPlanSettingsActions.scss';

type Props = {
  className?: string;
};

export const ProgrammingPlanSettingsActions = ({
  className,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  //FIXME DOMAIN implémenter les actions sur les boutons

  return (
    <span className={clsx('programming-plan-settings-actions', className)}>
      <Button
        title="Dupliquer"
        iconId="ri-file-copy-line"
        priority="tertiary"
        onClick={() => ({})}
      />
      <Button
        title="Supprimer"
        iconId="fr-icon-delete-bin-line"
        priority="tertiary"
        onClick={() => ({})}
      />
    </span>
  );
};
