import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isNil } from 'lodash-es';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { LocalPrescriptionCommentToCreate } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
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
  onSubmitLocalPrescriptionComment: (
    programmingPlan: ProgrammingPlan,
    localPrescriptionKey: LocalPrescriptionKey,
    comment: string
  ) => Promise<void>;
}

const PrescriptionCommentsModal = ({
  onSubmitLocalPrescriptionComment
}: Props) => {
  const dispatch = useAppDispatch();
  const {
    hasUserLocalPrescriptionPermission,
    user,
    hasNationalView,
    hasRegionalView,
    hasDepartmentalView
  } = useAuthentication();
  const { prescriptionCommentsData } = useAppSelector(
    (state) => state.prescriptions
  );

  const [newComment, setNewComment] = useState('');
  const [recipientsSegment, setRecipientsSegment] = useState<UserRole | null>(
    hasNationalView
      ? 'RegionalCoordinator'
      : hasRegionalView
        ? 'NationalCoordinator'
        : 'DepartmentalCoordinator'
  );
  const [currentTag, setCurrentTag] = useState<
    Region | Department | MatrixKind | null
  >(
    (prescriptionCommentsData?.viewBy === 'MatrixKind'
      ? prescriptionCommentsData.currentRegion
      : prescriptionCommentsData?.currentMatrixKind) ?? null
  );

  const Form = LocalPrescriptionCommentToCreate.pick({
    comment: true
  });

  const form = useForm(Form, {
    comment: newComment
  });

  useIsModalOpen(prescriptionCommentsModal, {
    onConceal: () => {
      setNewComment('');
      form.reset();
      dispatch(
        prescriptionsSlice.actions.setPrescriptionCommentsData(undefined)
      );
    }
  });

  useEffect(() => {
    if (prescriptionCommentsData) {
      if (prescriptionCommentsData.viewBy === 'MatrixKind') {
        setCurrentTag(
          prescriptionCommentsData.regionalComments.find(
            (_) => !isNil(_.department)
          )?.department ??
            prescriptionCommentsData.currentRegion ??
            prescriptionCommentsData.regionalComments[0].region
        );
      } else {
        setCurrentTag(
          prescriptionCommentsData.currentMatrixKind ??
            prescriptionCommentsData.matrixKindsComments[0].matrixKind
        );
      }
      prescriptionCommentsModal.open();
    }
  }, [prescriptionCommentsData]);

  const currentComments = useMemo(
    () =>
      prescriptionCommentsData?.viewBy === 'MatrixKind'
        ? prescriptionCommentsData?.regionalComments.find((_) =>
            recipientsSegment === 'DepartmentalCoordinator'
              ? _.department === currentTag
              : recipientsSegment === 'RegionalCoordinator'
                ? isNil(_.department) && _.region === currentTag
                : isNil(_.department)
          )
        : prescriptionCommentsData?.matrixKindsComments.find(
            (_) => _.matrixKind === currentTag
          ),
    [currentTag, prescriptionCommentsData, recipientsSegment]
  );

  const programmingPlan = useMemo(
    () =>
      prescriptionCommentsData?.viewBy === 'MatrixKind'
        ? prescriptionCommentsData?.programmingPlan
        : prescriptionCommentsData?.matrixKindsComments.find(
            (_) => _.matrixKind === currentTag
          )?.programmingPlan,
    [currentTag, prescriptionCommentsData]
  );

  const { commentsArray, hasComments } = useMemo(() => {
    const commentsArray = currentComments?.comments ?? [];
    const hasComments = commentsArray.length > 0;

    return { commentsArray, hasComments };
  }, [currentComments]);

  const getLocalPrescriptionPartialKey = useMemo(
    () => ({
      region:
        prescriptionCommentsData?.viewBy === 'MatrixKind'
          ? recipientsSegment === 'RegionalCoordinator'
            ? (currentTag as Region)
            : (user?.region as Region)
          : (prescriptionCommentsData?.region as Region),
      department:
        recipientsSegment === 'DepartmentalCoordinator'
          ? (currentTag as Department)
          : user?.department
    }),
    [currentTag, recipientsSegment, user, prescriptionCommentsData]
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (prescriptionCommentsData?.viewBy === 'MatrixKind') {
      await form.validate(async () => {
        await onSubmitLocalPrescriptionComment(
          prescriptionCommentsData.programmingPlan,
          {
            prescriptionId: prescriptionCommentsData.prescriptionId,
            ...getLocalPrescriptionPartialKey
          },
          newComment
        );
        prescriptionCommentsModal.close();
      });
    }
  };

  return (
    <>
      <prescriptionCommentsModal.Component
        title={
          <>
            {prescriptionCommentsData?.viewBy === 'MatrixKind' &&
              MatrixKindLabels[prescriptionCommentsData.matrixKind]}
            {prescriptionCommentsData?.viewBy === 'Region' &&
              `Région ${Regions[prescriptionCommentsData.region].name}`}
            {hasRegionalView &&
              prescriptionCommentsData?.viewBy === 'MatrixKind' &&
              programmingPlan?.distributionKind === 'SLAUGHTERHOUSE' &&
              prescriptionCommentsData.regionalComments.some(
                (_) => !isNil(_.department)
              ) && (
                <SegmentedControl
                  hideLegend
                  legend="Destinataire"
                  segments={[
                    {
                      label: `Administration centrale`,
                      nativeInputProps: {
                        checked: recipientsSegment === 'NationalCoordinator',
                        onChange: () =>
                          setRecipientsSegment('NationalCoordinator')
                      }
                    },
                    {
                      label: `Départements`,
                      nativeInputProps: {
                        checked:
                          recipientsSegment === 'DepartmentalCoordinator',
                        onChange: () =>
                          setRecipientsSegment('DepartmentalCoordinator')
                      }
                    }
                  ]}
                  className={clsx(cx('fr-mb-2w'), 'float-right')}
                />
              )}
          </>
        }
        concealingBackdrop={false}
        topAnchor
        className="prescription-comments-modal"
        size="large"
      >
        {prescriptionCommentsData && (
          <div data-testid="prescription-comments-modal">
            {(prescriptionCommentsData?.viewBy === 'Region' ||
              prescriptionCommentsData.regionalComments.length > 1) && (
              <TagsGroup
                smallTags
                tags={
                  prescriptionCommentsData?.viewBy === 'MatrixKind'
                    ? prescriptionCommentsData.regionalComments
                        .filter((regionalComment) =>
                          hasRegionalView
                            ? recipientsSegment === 'NationalCoordinator'
                              ? false
                              : !isNil(regionalComment.department)
                            : true
                        )
                        .map((regionalComment) => ({
                          children: `${
                            isNil(regionalComment.department)
                              ? Regions[regionalComment.region].name
                              : DepartmentLabels[regionalComment.department]
                          } (${regionalComment.comments.length})`,
                          pressed:
                            currentTag ===
                            (isNil(regionalComment.department)
                              ? regionalComment.region
                              : regionalComment.department),
                          nativeButtonProps: {
                            onClick: () =>
                              setCurrentTag(
                                isNil(regionalComment.department)
                                  ? regionalComment.region
                                  : regionalComment.department
                              )
                          }
                        }))
                    : (prescriptionCommentsData.matrixKindsComments.map(
                        (matrixKindComment) => ({
                          children: `${MatrixKindLabels[matrixKindComment.matrixKind]} (${matrixKindComment.comments.length})`,
                          pressed: currentTag === matrixKindComment.matrixKind,
                          nativeButtonProps: {
                            onClick: () =>
                              setCurrentTag(matrixKindComment.matrixKind)
                          }
                        })
                      ) as any)
                }
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
                Vous avez la possibilité d'échanger
                {hasRegionalView && ' avec le coordinateur national'}
                {hasDepartmentalView && ' avec le coordinateur régional'} à
                propos de la programmation {programmingPlan?.year} des
                prélèvements de cette matrice.
              </div>
            )}
            {programmingPlan &&
              hasUserLocalPrescriptionPermission(
                programmingPlan,
                getLocalPrescriptionPartialKey
              )?.comment && (
                <div className={clsx(cx('fr-mt-2w'), 'd-flex-justify-center')}>
                  <form id="login_form">
                    <AppTextAreaInput
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      inputForm={form}
                      inputKey="comment"
                      whenValid="Message correctement renseigné."
                      label={
                        recipientsSegment === 'NationalCoordinator'
                          ? 'Message au coordinateur national'
                          : recipientsSegment === 'RegionalCoordinator'
                            ? 'Message au coordinateur régional'
                            : 'Message au coordinateur départemental'
                      }
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
