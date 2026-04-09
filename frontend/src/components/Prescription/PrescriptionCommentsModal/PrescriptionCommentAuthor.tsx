import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import type { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { formatDateTime } from 'maestro-shared/utils/date';
import { useContext } from 'react';
import { ApiClientContext } from '../../../services/apiClient';
import { quote } from '../../../utils/stringUtils';

const PrescriptionCommentAuthor = ({
  comment,
  createdBy,
  createdAt
}: Pick<LocalPrescriptionComment, 'comment' | 'createdBy' | 'createdAt'>) => {
  const apiClient = useContext(ApiClientContext);
  const { data: author } = apiClient.useGetUserQuery({ userId: createdBy });

  if (!author) {
    return null;
  }

  return (
    <>
      <div className={cx('fr-text--sm', 'fr-mb-0')}>
        <b>{author.name}</b>{' '}
        {author.department
          ? DepartmentLabels[author.department]
          : author.region
            ? Regions[author.region].name
            : ''}
      </div>
      <div>
        <div className={cx('fr-text--md', 'fr-mb-1w')}>{quote(comment)}</div>
        <div className={cx('fr-text--xs', 'fr-text--light', 'fr-mb-0')}>
          Posté le{' '}
          {formatDateTime(
            createdAt,
            author.region ? Regions[author.region].timezone : undefined
          )}
        </div>
      </div>
    </>
  );
};

export default PrescriptionCommentAuthor;
