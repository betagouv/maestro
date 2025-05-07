import Notice from '@codegouvfr/react-dsfr/Notice';
import { FunctionComponent, useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ImpersonateContext } from './ImpersonateContext';

type Props = Record<never, never>;
export const ImpersonateNotice: FunctionComponent<Props> = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { impersonateUserId, setImpersonateUserId } = useContext(ImpersonateContext);

  const { user } = useAuthentication();
  return (
    <>
      {user && impersonateUserId && (
        <Notice
          title={`Connecté en tant que ${user.firstName} ${user.lastName}`}
          // description="Fermer pour retrouver votre identité"
          // severity="warning"
          isClosable={true}
          onClose={() => {
            setImpersonateUserId(null);
          }}
        />
      )}
    </>
  );
};
