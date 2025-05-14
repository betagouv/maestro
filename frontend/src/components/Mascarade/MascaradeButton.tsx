import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';

type Props = {
  modal: ReturnType<typeof createModal>;
};
export const MascaradeButton: FunctionComponent<Props> = ({
  modal,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasRole } = useAuthentication();

  return (
    <>
      {hasRole('Administrator') && (
        <>
          <Button
            iconId="fr-icon-group-line"
            className={cx('fr-btn--icon-left', 'fr-mb-0')}
            priority="tertiary no outline"
            title="Mascarade"
            onClick={() => {
              modal.open();
            }}
          >
            Mascarade
          </Button>
        </>
      )}
    </>
  );
};
