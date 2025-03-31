import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Regions } from 'maestro-shared/referential/Region';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { useGetUserQuery } from 'src/services/user.service';

interface Props {
  userId: string;
}

const RegionalPrescriptionCommentAuthor = ({ userId }: Props) => {
  const { data: user } = useGetUserQuery(userId);

  if (!user) {
    return <></>;
  }

  return (
    <div className={cx('fr-text--sm', 'fr-mb-0')}>
      <b>
        {user.firstName} {user.lastName}
      </b>
       - {UserRoleLabels[user.role]}
      {' '}
      {user.region ? Regions[user.region].name : ''}
    </div>
  );
};

export default RegionalPrescriptionCommentAuthor;
