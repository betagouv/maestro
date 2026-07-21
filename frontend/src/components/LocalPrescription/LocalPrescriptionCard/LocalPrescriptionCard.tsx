import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { Company } from 'maestro-shared/schema/Company/Company';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  getPrescriptionTitle,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { pluralize } from 'src/utils/stringUtils';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useAppDispatch } from '../../../hooks/useStore';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import PrescriptionBreadcrumb from '../../Prescription/PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import PrescriptionProgrammingInstruction from '../../Prescription/PrescriptionProgrammingInstruction/PrescriptionProgrammingInstruction';
import LocalPrescriptionButtons from '../LocalPrescriptionButtons/LocalPrescriptionButtons';
import LocalPrescriptionDistributionBadge from '../LocalPrescriptionDistributionBadge/LocalPrescriptionDistributionBadge';

interface Props {
  programmingPlan?: ProgrammingPlanChecked;
  prescription: Prescription;
  localPrescription?: LocalPrescription;
  subLocalPrescriptions?: LocalPrescription[];
  isSelected?: boolean;
  onToggleSelection?: () => void;
  companies?: Company[];
}

const LocalPrescriptionCard = ({
  programmingPlan,
  prescription,
  localPrescription,
  subLocalPrescriptions,
  isSelected,
  onToggleSelection,
  companies
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserLocalPrescriptionPermission, user, userRole } =
    useAuthentication();

  if (!programmingPlan || !localPrescription) {
    return null;
  }

  return (
    <div className={cx('fr-col-12', 'fr-col-md-6')}>
      <div
        className={clsx(cx('fr-card', 'fr-card--sm'), 'regional-card')}
        data-testid={`card-${prescription.id}`}
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
                  {getPrescriptionTitle(prescription)}
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
                Info prélèvement
              </Button>
            </div>
            {localPrescription.companySiret &&
              companies?.find((c) => c.siret === localPrescription.companySiret)
                ?.name}
            <div className="fr-card__end">
              <div>
                <span>
                  {pluralize(localPrescription.sampleCount ?? 0, {
                    preserveCount: true
                  })('prélèvement programmé')}
                </span>
                {(hasUserLocalPrescriptionPermission(
                  programmingPlan,
                  localPrescription
                )?.distributeToDepartments ||
                  hasUserLocalPrescriptionPermission(
                    programmingPlan,
                    localPrescription
                  )?.distributeToSlaughterhouses) && (
                  <>
                    {' • '}
                    <LocalPrescriptionDistributionBadge
                      localPrescription={localPrescription}
                      subLocalPrescriptions={subLocalPrescriptions}
                      small
                    />
                  </>
                )}
                <div className={cx('fr-mt-2w')}>
                  <PrescriptionProgrammingInstruction
                    programmingPlan={programmingPlan}
                    value={prescription.programmingInstruction}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <LocalPrescriptionButtons
          programmingPlan={programmingPlan}
          prescription={prescription}
          localPrescription={localPrescription}
          subLocalPrescriptions={subLocalPrescriptions}
        />
      </div>
    </div>
  );
};

export default LocalPrescriptionCard;
