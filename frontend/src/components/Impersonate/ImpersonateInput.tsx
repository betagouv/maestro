import { FunctionComponent, useContext } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useFindUsersQuery } from '../../services/user.service';
import AppSearchInput from '../_app/AppSearchInput/AppSearchInput';
import { selectOptionsFromList } from '../_app/AppSelect/AppSelectOption';
import { ImpersonateContext } from './ImpersonateContext';

type Props = Record<never, never>;
export const ImpersonateInput: FunctionComponent<Props> = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { user } = useAuthentication();
  const { setImpersonateUserId } = useContext(ImpersonateContext)

  return (
    <>
      {user?.role === 'Administrator' && (
        <UsersSearchInput setImpersonateId={setImpersonateUserId} />
      )}
    </>
  );
};

const UsersSearchInput: FunctionComponent<{
  setImpersonateId: (newValue: string | null) => void;
}> = ({ setImpersonateId, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { data: users } = useFindUsersQuery({});

  return (
    <>
      {' '}
      {users && (
        <AppSearchInput
          options={selectOptionsFromList(
            users
              .filter(({ firstName }) => firstName !== '-')
              .map(({ id }) => id),
            {
              labels: users.reduce(
                (acc, u) => {
                  acc[u.id] = `${u.firstName} ${u.lastName}`;
                  return acc;
                },
                {} as Record<string, string>
              ),
              withSort: true,
              withDefault: false
            }
          )}
          value={''}
          onSelect={(value) => setImpersonateId(value ?? null)}
        />
      )}
    </>
  );
};
