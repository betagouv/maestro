import Button from '@codegouvfr/react-dsfr/Button';
import { assert, type Equals } from 'tsafe';
import './SettingInheritanceLockButton.scss';

type Props = {
  isInherited: boolean;
  title: string;
  disabled?: boolean;
  onClick: () => void;
};

export const SettingInheritanceLockButton = ({
  isInherited,
  title,
  disabled,
  onClick,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <Button
      priority="tertiary"
      iconId={isInherited ? 'fr-icon-lock-fill' : 'fr-icon-lock-unlock-fill'}
      title={title}
      disabled={disabled}
      className={
        isInherited
          ? 'setting-inheritance-lock-btn--inherited'
          : 'setting-inheritance-lock-btn--detached'
      }
      onClick={onClick}
    />
  );
};
