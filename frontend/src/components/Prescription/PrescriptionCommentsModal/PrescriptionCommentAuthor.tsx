import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Regions } from 'maestro-shared/referential/Region';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { useContext } from 'react';
import { ApiClientContext } from '../../../services/apiClient';

interface Props {
  userId: string;
}

const PrescriptionCommentAuthor = ({ userId }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { data: user } = apiClient.useGetUserQuery(userId);

  if (!user) {
    return <></>;
  }

  return (
    <div className={cx('fr-text--sm', 'fr-mb-0')}>
      <b>
        {user.firstName} {user.lastName}
      </b>{' '}
      - {UserRoleLabels[user.role]}{' '}
      {user.region ? Regions[user.region].name : ''}
    </div>
  );
};

export default PrescriptionCommentAuthor;
