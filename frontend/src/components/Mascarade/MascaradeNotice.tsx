import Notice from '@codegouvfr/react-dsfr/Notice';
import { FunctionComponent, useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';
import { MascaradeContext } from './MascaradeContext';

type Props = Record<never, never>;
export const MascaradeNotice: FunctionComponent<Props> = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { mascaradeUserId, setMascaradeUserId } = useContext(MascaradeContext);

  const { user } = useAuthentication();
  return (
    <>
      {user && mascaradeUserId && (
        <Notice
          title="Mode mascarade"
          description={
            <>Vous êtes actuellement connecté en tant que {user.name}.</>
          }
          severity="cyberattack"
          iconDisplayed={true}
          isClosable={true}
          onClose={() => {
            setMascaradeUserId(null);
          }}
        />
      )}
    </>
  );
};
