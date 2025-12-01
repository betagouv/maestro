import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup, {
  ButtonsGroupProps
} from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil, sumBy } from 'lodash-es';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { isDefined } from 'maestro-shared/utils/utils';
import { useMemo } from 'react';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';
import './LocalPrescriptionButtons.scss';

type Props = {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  localPrescription: LocalPrescription;
  subLocalPrescriptions?: LocalPrescription[];
} & Pick<ButtonsGroupProps, 'alignment' | 'className'>;

const LocalPrescriptionButtons = ({
  programmingPlan,
  prescription,
  localPrescription,
  subLocalPrescriptions,
  ...buttonsGroupProps
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserLocalPrescriptionPermission, hasUserPermission } =
    useAuthentication();

  const hasEmptySubstanceKindsLaboratory = useMemo(
    () =>
      !localPrescription?.substanceKindsLaboratories ||
      localPrescription?.substanceKindsLaboratories.length === 0 ||
      localPrescription.substanceKindsLaboratories?.some((_) =>
        isNil(_.laboratoryId)
      ),
    [localPrescription]
  );

  const hasUncompletedRepartition = useMemo(
    () =>
      localPrescription.sampleCount >
      sumBy(subLocalPrescriptions, 'sampleCount'),
    [subLocalPrescriptions, localPrescription]
  );

  const commentsCount = useMemo(
    () =>
      [
        ...(localPrescription?.comments || []),
        ...(subLocalPrescriptions ?? [])
          .filter((_) => (_.comments || []).length > 0)
          .flatMap((_) => _.comments || [])
      ].length,
    [localPrescription, subLocalPrescriptions]
  );

  const buttons = useMemo(
    (): ButtonProps[] =>
      [
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.distributeToDepartments
          ? {
              children: <span className="no-wrap">Répartition</span>,
              priority: 'tertiary no outline',
              onClick: () =>
                dispatch(
                  prescriptionsSlice.actions.setLocalPrescriptionModalData({
                    mode: 'distributionToDepartments',
                    programmingPlan,
                    prescription,
                    localPrescription,
                    subLocalPrescriptions: subLocalPrescriptions ?? []
                  })
                ),
              iconId: !hasUncompletedRepartition && 'fr-icon-check-line',
              className: cx('fr-m-0')
            }
          : undefined,
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.distributeToSlaughterhouses
          ? {
              children: <span className="no-wrap">Abattoirs</span>,
              priority: 'tertiary no outline',
              onClick: () =>
                dispatch(
                  prescriptionsSlice.actions.setLocalPrescriptionModalData({
                    mode: 'distributionToSlaughterhouses',
                    programmingPlan,
                    prescription,
                    localPrescription,
                    subLocalPrescriptions: subLocalPrescriptions ?? []
                  })
                ),
              iconId: !hasUncompletedRepartition && 'fr-icon-check-line',
              className: cx('fr-m-0')
            }
          : undefined,
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.updateLaboratories
          ? {
              children: (
                <span className="no-wrap">
                  {pluralize(programmingPlan.substanceKinds.length ?? 0)(
                    'Laboratoire'
                  )}
                </span>
              ),
              priority: 'tertiary no outline',
              onClick: () =>
                dispatch(
                  prescriptionsSlice.actions.setLocalPrescriptionModalData({
                    mode: 'laboratory',
                    programmingPlan,
                    prescription,
                    localPrescription
                  })
                ),
              iconId: !hasEmptySubstanceKindsLaboratory && 'fr-icon-check-line',
              className: cx('fr-m-0'),
              nativeButtonProps: {
                'data-testid': 'update-laboratory-button'
              }
            }
          : undefined,
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.comment
          ? {
              children: (
                <span className="no-wrap">
                  {pluralize(commentsCount, {
                    preserveCount: true
                  })('commentaire')}
                </span>
              ),
              disabled:
                !hasUserLocalPrescriptionPermission(
                  programmingPlan,
                  localPrescription
                )?.comment && commentsCount === 0,
              priority: 'tertiary no outline',
              onClick: () =>
                dispatch(
                  prescriptionsSlice.actions.setPrescriptionCommentsData({
                    viewBy: 'Prescription',
                    programmingPlan,
                    prescription,
                    currentRegion: localPrescription.region,
                    regionalCommentsList: [
                      localPrescription,
                      ...(subLocalPrescriptions ?? []).filter(
                        (_) => (_.comments || []).length > 0
                      )
                    ].map((rcp) => ({
                      region: rcp.region,
                      department: rcp.department,
                      comments: rcp.comments || []
                    }))
                  })
                ),
              iconId: 'fr-icon-chat-3-line',
              className: cx('fr-m-0')
            }
          : undefined
      ].filter(isDefined) as ButtonProps[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [programmingPlan, prescription, localPrescription, subLocalPrescriptions]
  );

  if (buttons.length === 0) {
    return <></>;
  }

  return (
    <ButtonsGroup
      buttonsEquisized={false}
      buttonsSize="small"
      alignment="center"
      inlineLayoutWhen="always"
      className={clsx(cx('fr-m-0'), 'local-prescription-buttons')}
      {...buttonsGroupProps}
      buttons={[buttons[0], ...buttons.slice(1)]}
    />
  );
};

export default LocalPrescriptionButtons;
