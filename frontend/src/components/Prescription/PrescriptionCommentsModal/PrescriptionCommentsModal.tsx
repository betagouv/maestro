import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import { TagProps } from '@codegouvfr/react-dsfr/Tag';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { LocalPrescriptionCommentToCreate } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  getPrescriptionTitle,
  Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import {
  PrescriptionComments,
  PrescriptionCommentSort
} from 'maestro-shared/schema/Prescription/PrescriptionComments';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { formatDateTime } from 'maestro-shared/utils/date';
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

/**
 * @public - Used in Storybook
 */
export interface Props {
  onSubmitLocalPrescriptionComment: (
    programmingPlan: ProgrammingPlan,
    localPrescriptionKey: LocalPrescriptionKey,
    comment: string
  ) => Promise<void>;
}

const getPrescriptionTag = (prescription: Prescription) =>
  prescription.matrix ?? prescription.matrixKind;

const DefaultVisibleCount = 3;

const PrescriptionCommentsModal = ({
  onSubmitLocalPrescriptionComment
}: Props) => {
  const dispatch = useAppDispatch();
  const {
    hasUserLocalPrescriptionPermission,
    user,
    hasRegionalView,
    hasDepartmentalView
  } = useAuthentication();
  const { prescriptionCommentsData } = useAppSelector(
    (state) => state.prescriptions
  );

  const [newComment, setNewComment] = useState('');
  const [recipientsSegment, setRecipientsSegment] = useState<UserRole | null>(
    hasRegionalView ? 'NationalCoordinator' : 'RegionalCoordinator'
  );
  const [visibleCommentsCount, setVisibleCommentsCount] =
    useState(DefaultVisibleCount);
  const [currentTag, setCurrentTag] = useState<
    Region | Department | MatrixKind | Matrix | null
  >(() => {
    if (!prescriptionCommentsData) {
      return null;
    }
    if (prescriptionCommentsData.viewBy === 'Prescription') {
      return prescriptionCommentsData.currentRegion ?? null;
    }
    return prescriptionCommentsData.currentPrescription
      ? getPrescriptionTag(prescriptionCommentsData.currentPrescription)
      : null;
  });

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
      setVisibleCommentsCount(DefaultVisibleCount);
      dispatch(
        prescriptionsSlice.actions.setPrescriptionCommentsData(undefined)
      );
    }
  });

  useEffect(() => {
    if (prescriptionCommentsData) {
      if (prescriptionCommentsData.viewBy === 'Prescription') {
        setCurrentTag(
          prescriptionCommentsData.regionalCommentsList.find(
            (_) => !isNil(_.department)
          )?.department ??
            prescriptionCommentsData.currentRegion ??
            prescriptionCommentsData.regionalCommentsList[0].region
        );
      } else {
        setCurrentTag(
          getPrescriptionTag(
            prescriptionCommentsData.currentPrescription ??
              [...prescriptionCommentsData.prescriptionCommentsList].sort(
                PrescriptionCommentSort
              )[0].prescription
          )
        );
      }
      setVisibleCommentsCount(DefaultVisibleCount);

      setTimeout(() => {
        prescriptionCommentsModal.open();
      }, 1);
    }
  }, [prescriptionCommentsData]);

  useEffect(() => {
    setVisibleCommentsCount(DefaultVisibleCount);
  }, [currentTag]);

  const currentComments = useMemo(
    () =>
      prescriptionCommentsData?.viewBy === 'Prescription'
        ? prescriptionCommentsData?.regionalCommentsList.find((_) =>
            recipientsSegment === 'DepartmentalCoordinator' ||
            hasDepartmentalView
              ? _.department === currentTag
              : recipientsSegment === 'RegionalCoordinator'
                ? isNil(_.department) && _.region === currentTag
                : isNil(_.department)
          )
        : prescriptionCommentsData?.prescriptionCommentsList.find(
            ({ prescription }) =>
              getPrescriptionTag(prescription) === currentTag
          ),
    [
      currentTag,
      hasDepartmentalView,
      prescriptionCommentsData,
      recipientsSegment
    ]
  );

  const programmingPlan = useMemo(
    () =>
      prescriptionCommentsData?.viewBy === 'Prescription'
        ? prescriptionCommentsData?.programmingPlan
        : (currentComments as PrescriptionComments)?.programmingPlan,
    [prescriptionCommentsData, currentComments]
  );

  const { visibleComments, hasComments, hasMoreComments } = useMemo(() => {
    const commentsArray = [...(currentComments?.comments ?? [])].sort(
      (c1, c2) => c1.createdAt.getTime() - c2.createdAt.getTime()
    );
    const hasComments = commentsArray.length > 0;
    const totalComments = commentsArray.length;
    const startIndex = Math.max(0, totalComments - visibleCommentsCount);
    const visibleComments = commentsArray.slice(startIndex);
    const hasMoreComments = startIndex > 0;

    return {
      visibleComments,
      hasComments,
      hasMoreComments
    };
  }, [currentComments, visibleCommentsCount]);

  const getLocalPrescriptionPartialKey = useMemo(
    () => ({
      region:
        prescriptionCommentsData?.viewBy === 'Prescription'
          ? (Region.safeParse(currentTag).data ?? (user?.region as Region))
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

    await form.validate(async () => {
      const prescriptionId =
        prescriptionCommentsData?.viewBy === 'Prescription'
          ? prescriptionCommentsData.prescription.id
          : (currentComments as PrescriptionComments).prescription.id;

      const plan =
        prescriptionCommentsData?.viewBy === 'Prescription'
          ? prescriptionCommentsData.programmingPlan
          : (programmingPlan as ProgrammingPlan);

      await onSubmitLocalPrescriptionComment(
        plan,
        {
          prescriptionId,
          ...getLocalPrescriptionPartialKey
        },
        newComment
      );
      prescriptionCommentsModal.close();
    });
  };

  return (
    <>
      <prescriptionCommentsModal.Component
        title={
          <>
            {prescriptionCommentsData?.viewBy === 'Prescription' &&
              getPrescriptionTitle(prescriptionCommentsData.prescription)}
            {prescriptionCommentsData?.viewBy === 'Region' &&
              `Région ${Regions[prescriptionCommentsData.region].name}`}
            {hasRegionalView &&
              prescriptionCommentsData?.viewBy === 'Prescription' &&
              programmingPlan?.distributionKind === 'SLAUGHTERHOUSE' &&
              prescriptionCommentsData.regionalCommentsList.some(
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
              prescriptionCommentsData.regionalCommentsList.length > 1) && (
              <TagsGroup
                smallTags
                tags={
                  (prescriptionCommentsData?.viewBy === 'Prescription'
                    ? prescriptionCommentsData.regionalCommentsList
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
                    : [...prescriptionCommentsData.prescriptionCommentsList]
                        .sort(PrescriptionCommentSort)
                        .map((prescriptionComment) => ({
                          children: `${getPrescriptionTitle(prescriptionComment.prescription)} (${prescriptionComment.comments.length})`,
                          pressed:
                            currentTag ===
                            getPrescriptionTag(
                              prescriptionComment.prescription
                            ),
                          nativeButtonProps: {
                            onClick: () =>
                              setCurrentTag(
                                getPrescriptionTag(
                                  prescriptionComment.prescription
                                )
                              )
                          }
                        }))) as unknown as [TagProps, ...TagProps[]]
                }
              />
            )}
            {hasComments ? (
              <div className="comments-container">
                {hasMoreComments && (
                  <div
                    className={clsx('prescription-comment', 'more-comments')}
                  >
                    <Button
                      priority="tertiary no outline"
                      size="small"
                      onClick={() =>
                        setVisibleCommentsCount(
                          (prev) => prev + DefaultVisibleCount
                        )
                      }
                    >
                      Messages précédents
                    </Button>
                  </div>
                )}
                {visibleComments.map((comment) => (
                  <div
                    key={`${comment.createdBy}-${comment.createdAt.getTime()}`}
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
                        Posté le {formatDateTime(comment.createdAt)}
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
                    className="submit-button"
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
