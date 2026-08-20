import Button, { type ButtonProps } from '@codegouvfr/react-dsfr/Button';
import clsx from 'clsx';
import { assert, type Equals } from 'tsafe';
import './ProgrammingPlanSettingsActions.scss';

type Props = {
  size?: ButtonProps['size'];
  className?: string;
};

export const ProgrammingPlanSettingsActions = ({
  size,
  className,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  //FIXME DOMAIN implémenter les actions sur les boutons

  return (
    <span className={clsx('programming-plan-settings-actions', className)}>
      <Button
        size={size}
        title="Dupliquer"
        iconId="ri-file-copy-line"
        priority="tertiary"
        onClick={() => ({})}
      />
      <Button
        size={size}
        title="Supprimer"
        iconId="fr-icon-delete-bin-line"
        priority="tertiary"
        onClick={() => ({})}
      />
    </span>
  );
};
