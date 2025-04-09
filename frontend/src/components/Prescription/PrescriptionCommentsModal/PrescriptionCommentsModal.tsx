import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionCommentToCreate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import React, { useEffect, useMemo, useState } from 'react';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import PrescriptionCommentAuthor from 'src/components/Prescription/PrescriptionCommentsModal/PrescriptionCommentAuthor';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { quote } from 'src/utils/stringUtils';
import './PrescriptionCommentsModal.scss';

const prescriptionCommentsModal = createModal({
  id: `prescription-comments-modal`,
  isOpenedByDefault: false
});

interface Props {
  onSubmitRegionalPrescriptionComment: (
    regionalPrescriptionKey: RegionalPrescriptionKey,
    comment: string
  ) => Promise<void>;
}

const PrescriptionCommentsModal = ({
  onSubmitRegionalPrescriptionComment
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();
  const { prescriptionCommentsData } = useAppSelector(
    (state) => state.prescriptions
  );
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const [comment, setComment] = useState('');
  const [region, setRegion] = useState<Region>();

  const Form = RegionalPrescriptionCommentToCreate.pick({
    comment: true
  });

  const form = useForm(Form, {
    comment
  });

  type FormShape = typeof Form.shape;

  useIsModalOpen(prescriptionCommentsModal, {
    onConceal: () => {
      setComment('');
      form.reset();
      dispatch(
        prescriptionsSlice.actions.setPrescriptionCommentsData(undefined)
      );
    }
  });

  useEffect(() => {
    if (prescriptionCommentsData) {
      setRegion(prescriptionCommentsData.regionalPrescriptions[0].region);
      prescriptionCommentsModal.open();
    }
  }, [prescriptionCommentsData]);

  const currentRegionalPrescription = useMemo(
    () =>
      (prescriptionCommentsData?.regionalPrescriptions ?? []).find(
        (_) => _.region === region
      ),
    [prescriptionCommentsData?.regionalPrescriptions, region]
  );

  const { commentsArray, hasComments } = useMemo(() => {
    const commentsArray = currentRegionalPrescription?.comments ?? [];
    const hasComments = commentsArray.length > 0;

    return { commentsArray, hasComments };
  }, [currentRegionalPrescription]);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    await form.validate(async () => {
      await onSubmitRegionalPrescriptionComment(
        RegionalPrescriptionKey.parse(currentRegionalPrescription),
        comment
      );
      prescriptionCommentsModal.close();
    });
  };

  return (
    <>
      <prescriptionCommentsModal.Component
        title={
          prescriptionCommentsData
            ? MatrixKindLabels[prescriptionCommentsData.matrixKind]
            : ''
        }
        concealingBackdrop={false}
        topAnchor
        className="prescription-comments-modal"
      >
        {prescriptionCommentsData && (
          <>
            {prescriptionCommentsData.regionalPrescriptions.length > 1 && (
              <SegmentedControl
                hideLegend
                legend="Région"
                segments={
                  prescriptionCommentsData.regionalPrescriptions.map(
                    (regionalPrescription) => ({
                      label: Regions[regionalPrescription.region].name,
                      nativeInputProps: {
                        checked: region === regionalPrescription.region,
                        onChange: () => setRegion(regionalPrescription.region)
                      }
                    })
                  ) as any
                }
                className={cx('fr-mb-2w')}
              />
            )}
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
                        className={cx(
                          'fr-text--xs',
                          'fr-text--light',
                          'fr-mb-0'
                        )}
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
                Vous avez la possibilité d'échanger avec le coordinateur
                national à propos de la programmation 2025 des prélèvements de
                cette matrice.
              </div>
            )}
            {programmingPlan &&
              currentRegionalPrescription &&
              hasUserRegionalPrescriptionPermission(
                programmingPlan,
                currentRegionalPrescription
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
          </>
        )}
      </prescriptionCommentsModal.Component>
    </>
  );
};

export default PrescriptionCommentsModal;
