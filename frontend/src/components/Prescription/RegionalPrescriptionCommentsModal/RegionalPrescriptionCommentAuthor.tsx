import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Regions } from 'shared/referential/Region';
import { UserRoleLabels } from 'shared/schema/User/UserRole';
import { useGetUserInfosQuery } from 'src/services/user.service';

interface Props {
  userId: string;
}

const RegionalPrescriptionCommentAuthor = ({ userId }: Props) => {
  const { data: user } = useGetUserInfosQuery(userId);

  return (
    <div className={cx('fr-text--sm', 'fr-mb-0')}>
      <b>
        {user?.firstName} {user?.lastName}
      </b>
       - {user?.roles.map((role) => UserRoleLabels[role]).join(', ')}{' '}
      {user?.region ? Regions[user.region].name : ''}
    </div>
  );
};

export default RegionalPrescriptionCommentAuthor;
