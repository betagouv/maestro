import Badge from '@codegouvfr/react-dsfr/Badge';
import Button, { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil, sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import { useAppDispatch } from '../../../hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../../Prescription/PrescriptionBreadcrumb/PrescriptionBreadcrumb';

interface Props {
  programmingPlan?: ProgrammingPlan;
  prescription: Prescription;
  localPrescription?: LocalPrescription;
  subLocalPrescriptions?: LocalPrescription[];
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const LocalPrescriptionCard = ({
  programmingPlan,
  prescription,
  localPrescription,
  subLocalPrescriptions,
  isSelected,
  onToggleSelection
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserLocalPrescriptionPermission, hasUserPermission } =
    useAuthentication();

  const getComments = useCallback((localPrescription: LocalPrescription) => {
    return localPrescription?.comments || [];
  }, []);

  const subLocalPrescriptionsWithSamplesCount = useMemo(
    () =>
      (subLocalPrescriptions ?? []).filter((dp) => dp.sampleCount > 0).length,
    [subLocalPrescriptions]
  );

  const hasEmptySubstanceKindsLaboratory = useMemo(
    () =>
      !localPrescription?.substanceKindsLaboratories ||
      localPrescription?.substanceKindsLaboratories.length === 0 ||
      localPrescription.substanceKindsLaboratories?.some((_) =>
        isNil(_.laboratoryId)
      ),
    [localPrescription]
  );

  const buttons = useMemo(
    (): ButtonProps[] =>
      programmingPlan && localPrescription
        ? ([
            hasUserLocalPrescriptionPermission(
              programmingPlan,
              localPrescription
            )?.distributeToDepartments
              ? {
                  children:
                    subLocalPrescriptionsWithSamplesCount === 0 ? (
                      'Répartir aux départements'
                    ) : (
                      <span className="no-wrap">
                        {pluralize(subLocalPrescriptionsWithSamplesCount, {
                          preserveCount: true
                        })('département sélectionné')}
                      </span>
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
                  iconId: 'fr-icon-road-map-line',
                  className: cx('fr-m-0')
                }
              : undefined,
            hasUserLocalPrescriptionPermission(
              programmingPlan,
              localPrescription
            )?.distributeToSlaughterhouses
              ? {
                  children: (
                    <span className="no-wrap">
                      {subLocalPrescriptionsWithSamplesCount === 0
                        ? 'Répartir entre abattoirs'
                        : pluralize(subLocalPrescriptionsWithSamplesCount, {
                            preserveCount: true
                          })('abattoir sélectionné')}
                    </span>
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
                  iconId: 'fr-icon-road-map-line',
                  className: cx('fr-m-0')
                }
              : undefined,
            hasUserLocalPrescriptionPermission(
              programmingPlan,
              localPrescription
            )?.updateLaboratories
              ? {
                  children: (
                    <span className="no-wrap">
                      {hasEmptySubstanceKindsLaboratory
                        ? `Attribuer ${pluralize(
                            localPrescription?.substanceKindsLaboratories
                              ?.length ?? 0
                          )('le laboratoire')}`
                        : pluralize(
                            localPrescription?.substanceKindsLaboratories
                              ?.length ?? 0,
                            {
                              preserveCount: true
                            }
                          )('laboratoire sélectionné')}
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
                  iconId: hasEmptySubstanceKindsLaboratory
                    ? 'fr-icon-microscope-line'
                    : 'fr-icon-checkbox-line',
                  className: cx('fr-m-0'),
                  nativeButtonProps: {
                    'data-testid': 'update-laboratory-button'
                  }
                }
              : undefined,
            programmingPlan.distributionKind === 'REGIONAL' &&
            hasUserPermission('commentPrescription')
              ? {
                  children:
                    hasUserLocalPrescriptionPermission(
                      programmingPlan,
                      localPrescription
                    )?.comment &&
                    getComments(localPrescription).length === 0 ? (
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
                  iconId: 'fr-icon-chat-3-line',
                  className: cx('fr-m-0')
                }
              : undefined
          ].filter(isDefined) as ButtonProps[])
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      programmingPlan,
      prescription,
      localPrescription,
      subLocalPrescriptions,
      subLocalPrescriptionsWithSamplesCount
    ]
  );

  if (!programmingPlan || !localPrescription) {
    return <></>;
  }

  return (
    <div className={cx('fr-col-12', 'fr-col-md-6')}>
      <div
        className={clsx(cx('fr-card', 'fr-card--sm'), 'regional-card')}
        data-testid={`card-${prescription.matrixKind}`}
      >
        <div className={cx('fr-card__body')}>
          <div className={cx('fr-card__content')}>
            <div className="d-flex-align-start">
              <div className={clsx(cx('fr-mr-2w'), 'flex-grow-1')}>
                <PrescriptionBreadcrumb
                  prescription={prescription}
                  programmingPlan={programmingPlan}
                />
              </div>
              {onToggleSelection && (
                <Checkbox
                  options={[
                    {
                      label: '',
                      nativeInputProps: {
                        checked: isSelected,
                        onChange: onToggleSelection
                      }
                    }
                  ]}
                  small
                />
              )}
            </div>
            <div className="d-flex-align-center">
              <h3
                className={clsx(cx('fr-card__title', 'fr-mb-0'), 'flex-grow-1')}
              >
                <div className="flex-grow-1">
                  {MatrixKindLabels[prescription.matrixKind]}
                </div>
              </h3>
              <Button
                priority="tertiary"
                size="small"
                onClick={() =>
                  dispatch(
                    prescriptionsSlice.actions.setPrescriptionModalData({
                      mode: 'details',
                      programmingPlan,
                      prescription
                    })
                  )
                }
                className="no-wrap"
              >
                Instructions
              </Button>
            </div>
            <div className="fr-card__end">
              <div>
                {['Validated', 'Closed'].includes(
                  programmingPlan.regionalStatus.find(
                    (_) => _.region === localPrescription.region
                  )?.status as ProgrammingPlanStatus
                ) ? (
                  <>
                    <span className={cx('fr-text--bold')}>
                      {pluralize(localPrescription.realizedSampleCount ?? 0, {
                        preserveCount: true
                      })('prélèvement réalisé')}
                    </span>
                    {' sur '}
                    {pluralize(localPrescription.sampleCount ?? 0, {
                      preserveCount: true
                    })('programmé')}
                    {' • '}
                    <CompletionBadge localPrescriptions={localPrescription} />
                  </>
                ) : (
                  <>
                    <span>
                      {pluralize(localPrescription.sampleCount ?? 0, {
                        preserveCount: true
                      })('prélèvement programmé')}
                    </span>
                    <Badge
                      noIcon
                      severity={
                        sumBy(subLocalPrescriptions, 'sampleCount') ===
                        localPrescription.sampleCount
                          ? 'success'
                          : sumBy(subLocalPrescriptions, 'sampleCount') === 0
                            ? 'error'
                            : 'new'
                      }
                      className={'fr-mx-1w'}
                    >
                      {pluralize(sumBy(subLocalPrescriptions, 'sampleCount'), {
                        preserveCount: true
                      })('attribué')}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {buttons.length > 0 && (
          <ButtonsGroup
            buttonsEquisized
            buttonsSize="small"
            alignment="center"
            inlineLayoutWhen="always"
            className={cx('fr-m-0')}
            buttons={[buttons[0], ...buttons.slice(1)]}
          />
        )}
      </div>
    </div>
  );
};

export default LocalPrescriptionCard;
