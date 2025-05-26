import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useMemo } from 'react';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';
import './PrescriptionCommentsModal.scss';

interface Props {
  matrixKind: MatrixKind;
  regionalPrescription: RegionalPrescription;
}

const PrescriptionCommentsModalButton = ({
  matrixKind,
  regionalPrescription,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const dispatch = useAppDispatch();

  const comments = useMemo(() => {
    return regionalPrescription?.comments || [];
  }, [regionalPrescription?.comments]);

  return (
    <Button
      priority="tertiary no outline"
      size="small"
      className={clsx(cx('fr-link--sm', 'fr-mt-1w'), 'link-underline')}
      onClick={() =>
        dispatch(
          prescriptionsSlice.actions.setPrescriptionCommentsData({
            viewBy: 'MatrixKind',
            prescriptionId: regionalPrescription.prescriptionId,
            matrixKind,
            regionalComments: [regionalPrescription].map((rcp) => ({
              region: rcp.region,
              comments: rcp.comments ?? []
            }))
          })
        )
      }
    >
      <span
        className={cx(
          'fr-icon-question-answer-line',
          'fr-icon--sm',
          'fr-mr-1w'
        )}
      />
      {comments.length > 0
        ? `${comments.length} ${pluralize(comments.length)('commentaire')}`
        : 'Échanger avec le coordinateur national'}
    </Button>
  );
};

export default PrescriptionCommentsModalButton;
