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
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescriptionCommentToCreate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionKey';
import { useEffect, useMemo, useState } from 'react';
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
    programmingPlan: ProgrammingPlan,
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

  const [comment, setComment] = useState('');
  const [segment, setSegment] = useState(
    prescriptionCommentsData?.viewBy === 'MatrixKind'
      ? prescriptionCommentsData.currentRegion
      : prescriptionCommentsData?.currentMatrixKind
  );

  const Form = RegionalPrescriptionCommentToCreate.pick({
    comment: true
  });

  const form = useForm(Form, {
    comment
  });

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
      if (prescriptionCommentsData.viewBy === 'MatrixKind') {
        setSegment(
          prescriptionCommentsData.currentRegion ??
            prescriptionCommentsData.regionalComments[0].region
        );
      } else {
        setSegment(
          prescriptionCommentsData.currentMatrixKind ??
            prescriptionCommentsData.matrixKindsComments[0].matrixKind
        );
      }
      prescriptionCommentsModal.open();
    }
  }, [prescriptionCommentsData]);

  const segmentedComments = useMemo(
    () =>
      prescriptionCommentsData?.viewBy === 'MatrixKind'
        ? prescriptionCommentsData?.regionalComments.find(
            (_) => _.region === segment
          )
        : prescriptionCommentsData?.matrixKindsComments.find(
            (_) => _.matrixKind === segment
          ),
    [segment, prescriptionCommentsData]
  );

  const programmingPlan = useMemo(
    () =>
      prescriptionCommentsData?.viewBy === 'MatrixKind'
        ? prescriptionCommentsData?.programmingPlan
        : prescriptionCommentsData?.matrixKindsComments.find(
            (_) => _.matrixKind === segment
          )?.programmingPlan,
    [segment, prescriptionCommentsData]
  );

  const { commentsArray, hasComments } = useMemo(() => {
    const commentsArray = segmentedComments?.comments ?? [];
    const hasComments = commentsArray.length > 0;

    return { commentsArray, hasComments };
  }, [segmentedComments]);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (
      prescriptionCommentsData?.viewBy === 'MatrixKind' &&
      Region.safeParse(segment).success
    ) {
      await form.validate(async () => {
        await onSubmitRegionalPrescriptionComment(
          prescriptionCommentsData.programmingPlan,
          {
            prescriptionId: prescriptionCommentsData.prescriptionId,
            region: segment as Region
          },
          comment
        );
        prescriptionCommentsModal.close();
      });
    }
  };

  return (
    <>
      <prescriptionCommentsModal.Component
        title={
          prescriptionCommentsData
            ? prescriptionCommentsData.viewBy === 'MatrixKind'
              ? MatrixKindLabels[prescriptionCommentsData.matrixKind]
              : `Région ${Regions[prescriptionCommentsData.region].name}`
            : ''
        }
        concealingBackdrop={false}
        topAnchor
        className="prescription-comments-modal"
      >
        {prescriptionCommentsData && (
          <div data-testid="prescription-comments-modal">
            {(prescriptionCommentsData?.viewBy === 'Region' ||
              prescriptionCommentsData.regionalComments.length > 1) && (
              <SegmentedControl
                hideLegend
                legend="Région"
                small
                segments={
                  prescriptionCommentsData?.viewBy === 'MatrixKind'
                    ? prescriptionCommentsData.regionalComments.map(
                        (regionalComment) => ({
                          label: Regions[regionalComment.region].name,
                          nativeInputProps: {
                            checked: segment === regionalComment.region,
                            onChange: () => setSegment(regionalComment.region)
                          }
                        })
                      )
                    : (prescriptionCommentsData.matrixKindsComments.map(
                        (matrixKindComment) => ({
                          label: MatrixKindLabels[matrixKindComment.matrixKind],
                          nativeInputProps: {
                            checked: segment === matrixKindComment.matrixKind,
                            onChange: () =>
                              setSegment(matrixKindComment.matrixKind)
                          }
                        })
                      ) as any)
                }
                className={cx('fr-mb-2w')}
              />
            )}
            {hasComments ? (
              <div className="comments-container">
                {commentsArray.map((comment, index) => (
                  <div
                    key={`comment-${index}`}
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
              Region.safeParse(segment).success &&
              hasUserRegionalPrescriptionPermission(programmingPlan, {
                region: segment as Region
              })?.comment && (
                <div className={clsx(cx('fr-mt-2w'), 'd-flex-justify-center')}>
                  <form id="login_form">
                    <AppTextAreaInput
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      inputForm={form}
                      inputKey="comment"
                      whenValid="Commentaire correctement renseigné."
                      label="Commentaire"
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
          </div>
        )}
      </prescriptionCommentsModal.Component>
    </>
  );
};

export default PrescriptionCommentsModal;
