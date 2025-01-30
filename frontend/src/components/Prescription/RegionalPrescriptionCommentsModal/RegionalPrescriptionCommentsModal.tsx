import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionCommentToCreate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import React, { useEffect, useMemo, useState } from 'react';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import RegionalPrescriptionCommentAuthor from 'src/components/Prescription/RegionalPrescriptionCommentsModal/RegionalPrescriptionCommentAuthor';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { quote } from 'src/utils/stringUtils';
import './RegionalPrescriptionCommentsModal.scss';

const regionalPrescriptionCommentsModal = createModal({
  id: `prescription-comments-modal`,
  isOpenedByDefault: false
});

interface Props {
  onSubmitRegionalPrescriptionComment: (
    regionalPrescriptionKey: RegionalPrescriptionKey,
    comment: string
  ) => Promise<void>;
}

const RegionalPrescriptionCommentsModal = ({
  onSubmitRegionalPrescriptionComment
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();
  const { regionalPrescriptionComments } = useAppSelector(
    (state) => state.prescriptions
  );
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const [comment, setComment] = useState('');

  const Form = RegionalPrescriptionCommentToCreate.pick({
    comment: true
  });

  const form = useForm(Form, {
    comment
  });

  type FormShape = typeof Form.shape;

  useIsModalOpen(regionalPrescriptionCommentsModal, {
    onConceal: () => {
      setComment('');
      form.reset();
      dispatch(
        prescriptionsSlice.actions.setRegionalPrescriptionComments(undefined)
      );
    }
  });

  useEffect(() => {
    if (regionalPrescriptionComments) {
      regionalPrescriptionCommentsModal.open();
    }
  }, [regionalPrescriptionComments]);

  const { commentsArray, hasComments } = useMemo(() => {
    const commentsArray = regionalPrescriptionComments?.comments ?? [];
    const hasComments = commentsArray.length > 0;

    return { commentsArray, hasComments };
  }, [regionalPrescriptionComments?.comments]);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    await form.validate(async () => {
      await onSubmitRegionalPrescriptionComment(
        RegionalPrescriptionKey.parse(regionalPrescriptionComments),
        comment
      );
      regionalPrescriptionCommentsModal.close();
    });
  };

  return (
    <>
      <regionalPrescriptionCommentsModal.Component
        title={
          hasComments
            ? `${commentsArray.length} commentaires`
            : 'Ajouter un commentaire'
        }
        concealingBackdrop={false}
        topAnchor
        className="prescription-comments-modal"
      >
        {hasComments ? (
          <div className="comments-container">
            {commentsArray.map((comment, index) => (
              <div
                key={`${comment.id}-${index}`}
                className="prescription-comment"
              >
                <RegionalPrescriptionCommentAuthor userId={comment.createdBy} />
                <div>
                  <div className={cx('fr-text--md', 'fr-mb-1w')}>
                    {quote(comment.comment)}
                  </div>
                  <div
                    className={cx('fr-text--xs', 'fr-text--light', 'fr-mb-0')}
                  >
                    Posté le{' '}
                    {format(comment.createdAt, 'dd MMMM yyyy à HH:mm', {
                      locale: fr
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cx('fr-text--md', 'fr-mb-0')}>
            Vous avez la possibilité d'échanger avec le coordinateur national à
            propos de la programmation 2025 des prélèvements de cette matrice.
          </div>
        )}
        {programmingPlan &&
          regionalPrescriptionComments &&
          hasUserRegionalPrescriptionPermission(
            programmingPlan,
            regionalPrescriptionComments
          )?.comment && (
            <div className={clsx(cx('fr-mt-2w'), 'd-flex-justify-center')}>
              <form id="login_form">
                <AppTextAreaInput<FormShape>
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  inputForm={form}
                  inputKey="comment"
                  whenValid="Commentaire correctement renseigné."
                  label="Commentaire"
                  rows={1}
                  required
                />
              </form>
              <Button
                priority="secondary"
                className={cx('fr-ml-2w')}
                onClick={submit}
              >
                Envoyer
              </Button>
            </div>
          )}
      </regionalPrescriptionCommentsModal.Component>
    </>
  );
};

export default RegionalPrescriptionCommentsModal;
