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
import { useCallback } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import RegionalPrescriptionLaboratory from 'src/components/Prescription/RegionalPrescriptionLaboratory/RegionalPrescriptionLaboratory';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import { useAppDispatch } from '../../../hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import './RegionalPrescriptionCard.scss';

interface Props {
  programmingPlan?: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription?: RegionalPrescription;
  onChangeLaboratory: (laboratoryId: string) => Promise<void>;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const RegionalPrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  onChangeLaboratory,
  isSelected,
  onToggleSelection
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserRegionalPrescriptionPermission } = useAuthentication();

  const getComments = useCallback(
    (regionalPrescription: RegionalPrescription) => {
      return regionalPrescription?.comments || [];
    },
    []
  );

  if (!programmingPlan || !regionalPrescription) {
    return <></>;
  }

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
            <PrescriptionBreadcrumb
              prescription={prescription}
              programmingPlan={programmingPlan}
            />
            <h3 className={clsx(cx('fr-card__title'), 'd-flex-align-center')}>
              <div className="flex-grow-1">
                {MatrixKindLabels[prescription.matrixKind]}
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
                  classes={{
                    content: 'fr-mt-1v'
                  }}
                />
              )}
            </h3>
            <div className="fr-card__end">
              {hasUserRegionalPrescriptionPermission(
                programmingPlan,
                regionalPrescription
              )?.updateLaboratory && (
                <RegionalPrescriptionLaboratory
                  regionalPrescription={regionalPrescription}
                  onChangeLaboratory={onChangeLaboratory}
                />
              )}
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
            {
              children: 'Détails',
              priority: 'tertiary no outline',
              onClick: () =>
                dispatch(
                  prescriptionsSlice.actions.setPrescriptionEditData({
                    mode: 'details',
                    programmingPlan,
                    prescription
                  })
                ),
              iconId: 'fr-icon-survey-line',
              className: cx('fr-m-0')
            },
            {
              children: 'Répartir',
              priority: 'tertiary no outline',
              onClick: () => {},
              iconId: 'fr-icon-team-line',
              className: cx('fr-m-0')
            },
            hasUserRegionalPrescriptionPermission(
              programmingPlan,
              regionalPrescription
            )?.comment
              ? {
                  children:
                    getComments(regionalPrescription).length > 0
                      ? `${getComments(regionalPrescription).length} ${pluralize(getComments(regionalPrescription).length)('commentaire')}`
                      : 'Échanger',
                  priority: 'tertiary no outline',
                  onClick: () =>
                    dispatch(
                      prescriptionsSlice.actions.setPrescriptionCommentsData({
                        viewBy: 'MatrixKind',
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
          ].filter(isDefined)}
        />
      </div>
    </div>
  );
};

export default RegionalPrescriptionCard;
