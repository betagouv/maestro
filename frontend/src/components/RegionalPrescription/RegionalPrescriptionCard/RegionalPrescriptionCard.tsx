import Badge from '@codegouvfr/react-dsfr/Badge';
import Button, { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useContext, useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import { useAppDispatch } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../../Prescription/PrescriptionBreadcrumb/PrescriptionBreadcrumb';

interface Props {
  programmingPlan?: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription?: LocalPrescription;
  departmentalPrescriptions?: LocalPrescription[];
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const RegionalPrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  departmentalPrescriptions,
  isSelected,
  onToggleSelection
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { hasUserLocalPrescriptionPermission } = useAuthentication();

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();

  const getComments = useCallback((regionalPrescription: LocalPrescription) => {
    return regionalPrescription?.comments || [];
  }, []);

  const departmentalPrescriptionsWithSamplesCount = useMemo(
    () =>
      (departmentalPrescriptions ?? []).filter((dp) => dp.sampleCount > 0)
        .length,
    [departmentalPrescriptions]
  );

  const currentLaboratory = laboratories?.find(
    (laboratory) => laboratory.id === regionalPrescription?.laboratoryId
  );

  const buttons = useMemo(
    (): ButtonProps[] =>
      programmingPlan && regionalPrescription
        ? ([
            hasUserLocalPrescriptionPermission(
              programmingPlan,
              regionalPrescription
            )?.distributeToDepartments
              ? {
                  children:
                    departmentalPrescriptionsWithSamplesCount === 0 ? (
                      'Répartir aux départements'
                    ) : (
                      <span className="no-wrap">
                        {pluralize(departmentalPrescriptionsWithSamplesCount, {
                          preserveCount: true
                        })('département sélectionné')}
                      </span>
                    ),
                  priority: 'tertiary no outline',
                  onClick: () =>
                    dispatch(
                      prescriptionsSlice.actions.setRegionalPrescriptionModalData(
                        {
                          mode: 'distribution',
                          programmingPlan,
                          prescription,
                          regionalPrescription,
                          departmentalPrescriptions:
                            departmentalPrescriptions || []
                        }
                      )
                    ),
                  iconId: 'fr-icon-road-map-line',
                  className: cx('fr-m-0')
                }
              : undefined,
            hasUserLocalPrescriptionPermission(
              programmingPlan,
              regionalPrescription
            )?.updateLaboratory
              ? {
                  children: (
                    <span className="no-wrap">
                      {currentLaboratory
                        ? `Laboratoire ${currentLaboratory.name}`
                        : 'Attribuer un laboratoire'}
                    </span>
                  ),
                  priority: 'tertiary no outline',
                  onClick: () =>
                    dispatch(
                      prescriptionsSlice.actions.setRegionalPrescriptionModalData(
                        {
                          mode: 'laboratory',
                          programmingPlan,
                          prescription,
                          regionalPrescription
                        }
                      )
                    ),
                  iconId: currentLaboratory
                    ? undefined
                    : 'fr-icon-microscope-line',
                  className: cx('fr-m-0')
                }
              : undefined,
            programmingPlan.distributionKind === 'REGIONAL'
              ? {
                  children:
                    hasUserLocalPrescriptionPermission(
                      programmingPlan,
                      regionalPrescription
                    )?.comment &&
                    getComments(regionalPrescription).length === 0 ? (
                      'Commenter'
                    ) : (
                      <span className="no-wrap">
                        {pluralize(getComments(regionalPrescription).length, {
                          preserveCount: true
                        })('commentaire')}
                      </span>
                    ),
                  disabled:
                    !hasUserLocalPrescriptionPermission(
                      programmingPlan,
                      regionalPrescription
                    )?.comment &&
                    getComments(regionalPrescription).length === 0,
                  priority: 'tertiary no outline',
                  onClick: () =>
                    dispatch(
                      prescriptionsSlice.actions.setPrescriptionCommentsData({
                        viewBy: 'MatrixKind',
                        programmingPlan,
                        prescriptionId: prescription.id,
                        matrixKind: prescription.matrixKind,
                        regionalComments: [regionalPrescription].map((rcp) => ({
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
      regionalPrescription,
      currentLaboratory,
      departmentalPrescriptions,
      departmentalPrescriptionsWithSamplesCount
    ]
  );

  if (!programmingPlan || !regionalPrescription) {
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
              {hasUserLocalPrescriptionPermission(
                programmingPlan,
                regionalPrescription
              )?.updateLaboratory && (
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
                {['InProgress', 'SubmittedToRegion'].includes(
                  programmingPlan.regionalStatus.find(
                    (_) => _.region === regionalPrescription.region
                  )?.status as ProgrammingPlanStatus
                ) ? (
                  <>
                    <span>
                      {pluralize(regionalPrescription.sampleCount ?? 0, {
                        preserveCount: true
                      })('prélèvement programmé')}
                    </span>
                    {hasUserLocalPrescriptionPermission(
                      programmingPlan,
                      regionalPrescription
                    )?.distributeToDepartments && (
                      <Badge
                        noIcon
                        severity={
                          sumBy(departmentalPrescriptions, 'sampleCount') ===
                          regionalPrescription.sampleCount
                            ? 'success'
                            : sumBy(
                                  departmentalPrescriptions,
                                  'sampleCount'
                                ) === 0
                              ? 'error'
                              : 'new'
                        }
                        className={'fr-mx-1w'}
                      >
                        {pluralize(
                          sumBy(departmentalPrescriptions, 'sampleCount'),
                          {
                            preserveCount: true
                          }
                        )('attribué')}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <span className={cx('fr-text--bold')}>
                      {pluralize(
                        regionalPrescription.realizedSampleCount ?? 0,
                        {
                          preserveCount: true
                        }
                      )('prélèvement réalisé')}
                    </span>
                    {' sur '}
                    {pluralize(regionalPrescription.sampleCount ?? 0, {
                      preserveCount: true
                    })('programmé')}
                    {' • '}
                    <CompletionBadge
                      regionalPrescriptions={regionalPrescription}
                    />
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

export default RegionalPrescriptionCard;
