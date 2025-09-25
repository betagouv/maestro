import Notice from '@codegouvfr/react-dsfr/Notice';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useMascarade } from './useMascarade';

type Props = Record<never, never>;
export const MascaradeNotice: FunctionComponent<Props> = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { mascaradeEnabled, disableMascarade } = useMascarade();

  const { user } = useAuthentication();
  return (
    <>
      {user && mascaradeEnabled && (
        <Notice
          title="Mode mascarade"
          description={
            <>Vous êtes actuellement connecté en tant que {user.name}.</>
          }
          severity="cyberattack"
          iconDisplayed={true}
          isClosable={true}
          onClose={() => {
            disableMascarade();
          }}
        />
      )}
    </>
  );
};
