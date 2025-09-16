import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup, {
  ButtonsGroupProps
} from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { isNil } from 'lodash-es';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useMemo } from 'react';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';

type Props = {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  localPrescription: LocalPrescription;
  subLocalPrescriptions?: LocalPrescription[];
  noIcon?: boolean;
} & Pick<ButtonsGroupProps, 'alignment' | 'className'>;

const LocalPrescriptionButtons = ({
  programmingPlan,
  prescription,
  localPrescription,
  subLocalPrescriptions,
  noIcon = false,
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

  const getComments = useCallback((localPrescription: LocalPrescription) => {
    return localPrescription?.comments || [];
  }, []);

  const buttons = useMemo(
    (): ButtonProps[] =>
      [
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.distributeToDepartments
          ? {
              children: (
                <span className="no-wrap">Répartir aux départements</span>
              ),
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
              iconId: noIcon ? undefined : 'fr-icon-road-map-line',
              className: cx('fr-m-0')
            }
          : undefined,
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.distributeToSlaughterhouses
          ? {
              children: (
                <span className="no-wrap">Répartir entre abattoirs</span>
              ),
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
              iconId: noIcon ? undefined : 'fr-icon-road-map-line',
              className: cx('fr-m-0')
            }
          : undefined,
        hasUserLocalPrescriptionPermission(programmingPlan, localPrescription)
          ?.updateLaboratories
          ? {
              children: (
                <span className="no-wrap">
                  Attribuer{' '}
                  {pluralize(programmingPlan.substanceKinds.length ?? 0)(
                    'le laboratoire'
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
              iconId: noIcon
                ? undefined
                : hasEmptySubstanceKindsLaboratory
                  ? 'fr-icon-microscope-line'
                  : 'fr-icon-checkbox-line',
              className: cx('fr-m-0'),
              nativeButtonProps: {
                'data-testid': 'update-laboratory-button'
              }
            }
          : undefined,
        hasUserPermission('commentPrescription')
          ? {
              children:
                hasUserLocalPrescriptionPermission(
                  programmingPlan,
                  localPrescription
                )?.comment && getComments(localPrescription).length === 0 ? (
                  'Commenter'
                ) : (
                  <span className="no-wrap">
                    {pluralize(getComments(localPrescription).length, {
                      preserveCount: true
                    })('commentaire')}
                  </span>
                ),
              disabled:
                !hasUserLocalPrescriptionPermission(
                  programmingPlan,
                  localPrescription
                )?.comment && getComments(localPrescription).length === 0,
              priority: 'tertiary no outline',
              onClick: () =>
                dispatch(
                  prescriptionsSlice.actions.setPrescriptionCommentsData({
                    viewBy: 'MatrixKind',
                    programmingPlan,
                    prescriptionId: prescription.id,
                    matrixKind: prescription.matrixKind,
                    regionalComments: [localPrescription].map((rcp) => ({
                      region: rcp.region,
                      comments: getComments(rcp)
                    }))
                  })
                ),
              iconId: noIcon ? undefined : 'fr-icon-chat-3-line',
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
      className={cx('fr-m-0')}
      {...buttonsGroupProps}
      buttons={[buttons[0], ...buttons.slice(1)]}
    />
  );
};

export default LocalPrescriptionButtons;
