import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import clsx from 'clsx';
import { format } from 'date-fns';
import { default as fr } from 'date-fns/locale/fr';
import { useMemo, useState } from 'react';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { PrescriptionCommentToCreate } from 'shared/schema/Prescription/PrescriptionComment';
import PrescriptionCommentAuthor from 'src/components/Prescription/PrescriptionCommentsModal/PrescriptionCommentAuthor';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from 'src/hooks/useForm';
import { useCommentPrescriptionMutation } from 'src/services/prescription.service';
import { quote } from 'src/utils/stringUtils';
import './PrescriptionCommentsModal.scss';
interface Props extends Pick<Prescription, 'programmingPlanId' | 'comments'> {
  prescriptionId: string;
  modalButton: React.ReactNode;
}

const PrescriptionCommentsModal = ({
  prescriptionId,
  programmingPlanId,
  comments,
  modalButton,
}: Props) => {
  const prescriptionCommentsModal = useMemo(
    () =>
      createModal({
        id: `prescription-comments-modal-${prescriptionId}`,
        isOpenedByDefault: false,
      }),
    [prescriptionId]
  );

  const [comment, setComment] = useState('');
  const [commentPrescription, { isError }] = useCommentPrescriptionMutation();

  const Form = PrescriptionCommentToCreate.pick({
    comment: true,
  });

  const form = useForm(Form, {
    comment,
  });

  type FormShape = typeof Form.shape;

  useIsModalOpen(prescriptionCommentsModal, {
    onConceal: () => {
      setComment('');
      form.reset();
    },
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    await form.validate(async () => {
      await commentPrescription({
        prescriptionId,
        commentToCreate: {
          programmingPlanId,
          comment,
        },
      });
      setComment('');
      form.reset();
    });
  };

  const { commentsArray, hasComments } = useMemo(() => {
    const commentsArray = comments ?? [];
    const hasComments = commentsArray.length > 0;

    return { commentsArray, hasComments };
  }, [comments]);

  return (
    <>
      <div onClick={() => prescriptionCommentsModal.open()}>{modalButton}</div>
      <prescriptionCommentsModal.Component
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
                <PrescriptionCommentAuthor userId={comment.createdBy} />
                <div>
                  <div className={cx('fr-text--md', 'fr-mb-1w')}>
                    {quote(comment.comment)}
                  </div>
                  <div
                    className={cx('fr-text--xs', 'fr-text--light', 'fr-mb-0')}
                  >
                    Posté le{' '}
                    {format(comment.createdAt, 'dd MMMM yyyy à HH:mm', {
                      locale: fr,
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
        {isError && (
          <Alert
            severity="error"
            description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
            small
            className={'fr-my-2w'}
          />
        )}
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
      </prescriptionCommentsModal.Component>
    </>
  );
};

export default PrescriptionCommentsModal;
