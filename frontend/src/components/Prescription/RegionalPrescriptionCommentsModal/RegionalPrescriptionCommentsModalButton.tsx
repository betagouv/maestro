import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useMemo } from 'react';
import { RegionalPrescription } from 'shared/schema/RegionalPrescription/RegionalPrescription';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { pluralize } from 'src/utils/stringUtils';
import './RegionalPrescriptionCommentsModal.scss';

interface Props {
  regionalPrescription: RegionalPrescription;
}

const RegionalPrescriptionCommentsModalButton = ({
  regionalPrescription
}: Props) => {
  const dispatch = useAppDispatch();

  const comments = useMemo(() => {
    return regionalPrescription?.comments || [];
  }, [regionalPrescription?.comments]);

  return (
    <Button
      priority="tertiary no outline"
      size="small"
      iconId={'fr-icon-question-answer-line'}
      className={clsx(cx('fr-link--sm'), 'link-underline')}
      onClick={() =>
        dispatch(
          prescriptionsSlice.actions.setRegionalPrescriptionComments(
            regionalPrescription
          )
        )
      }
    >
      {comments.length > 0
        ? `${comments.length} ${pluralize(comments.length)('commentaire')}`
        : 'Échanger avec le coordinateur national'}
    </Button>
  );
};

export default RegionalPrescriptionCommentsModalButton;