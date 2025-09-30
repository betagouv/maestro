import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useContext, useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import { useAppDispatch } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../../Prescription/PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import './RegionalPrescriptionCard.scss';

interface Props {
  programmingPlan?: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription?: RegionalPrescription;
  departmentalPrescriptions?: RegionalPrescription[];
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
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();

  const getComments = useCallback(
    (regionalPrescription: RegionalPrescription) => {
      return regionalPrescription?.comments || [];
    },
    []
  );

  if (!programmingPlan || !regionalPrescription) {
    return <></>;
  }

  const currentLaboratory = laboratories?.find(
    (laboratory) => laboratory.id === regionalPrescription?.laboratoryId
  );

  const departmentalPrescriptionsWithSamples = useMemo(
    () =>
      (departmentalPrescriptions ?? []).filter((dp) => dp.sampleCount > 0)
        .length,
    [departmentalPrescriptions]
  );

  return (
    <div className={cx('fr-col-12', 'fr-col-md-6')}>
      <div
        className={clsx(
          cx('fr-card', 'fr-card--sm'),
          'regional-prescription-card'
        )}
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
              {hasUserRegionalPrescriptionPermission(
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
                {['InProgress', 'Submitted'].includes(
                  programmingPlan.regionalStatus.find(
                    (_) => _.region === regionalPrescription.region
                  )?.status as ProgrammingPlanStatus
                ) ? (
                  <span>
                    {regionalPrescription.sampleCount ?? 0}{' '}
                    {pluralize(regionalPrescription.sampleCount ?? 0)(
                      'prélèvement programmé'
                    )}
                  </span>
                ) : (
                  <>
                    <span className={cx('fr-text--bold')}>
                      {regionalPrescription.realizedSampleCount ?? 0}{' '}
                      {pluralize(regionalPrescription.realizedSampleCount ?? 0)(
                        'prélèvement réalisé'
                      )}
                    </span>
                    {' sur '}
                    {regionalPrescription.sampleCount ?? 0}{' '}
                    {pluralize(regionalPrescription.sampleCount ?? 0)(
                      'programmé'
                    )}
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
        <ButtonsGroup
          buttonsEquisized
          buttonsSize="small"
          alignment="center"
          inlineLayoutWhen="always"
          className={cx('fr-m-0')}
          buttons={[
            hasUserRegionalPrescriptionPermission(
              programmingPlan,
              regionalPrescription
            )?.distributeToDepartments
              ? {
                  children:
                    departmentalPrescriptionsWithSamples === 0
                      ? 'Répartir aux départements'
                      : `${departmentalPrescriptionsWithSamples} ${pluralize(departmentalPrescriptionsWithSamples)('département sélectionné')}`,
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
            hasUserRegionalPrescriptionPermission(
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
            {
              children:
                hasUserRegionalPrescriptionPermission(
                  programmingPlan,
                  regionalPrescription
                )?.comment && getComments(regionalPrescription).length === 0 ? (
                  'Commenter'
                ) : (
                  <span className="no-wrap">
                    {getComments(regionalPrescription).length}{' '}
                    {pluralize(getComments(regionalPrescription).length)(
                      'commentaire'
                    )}
                  </span>
                ),
              disabled:
                !hasUserRegionalPrescriptionPermission(
                  programmingPlan,
                  regionalPrescription
                )?.comment && getComments(regionalPrescription).length === 0,
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
          ].filter(isDefined)}
        />
      </div>
    </div>
  );
};

export default RegionalPrescriptionCard;
