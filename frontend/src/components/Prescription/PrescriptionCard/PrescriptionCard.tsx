import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy, uniq } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import { Stage } from 'maestro-shared/referential/Stage';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import PrescriptionCardPartialTable from 'src/components/Prescription/PrescriptionCard/PrescriptionCardPartialTable';
import PrescriptionNotes from 'src/components/Prescription/PrescriptionNotes/PrescriptionNotes';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import PrescriptionSubstancesModalButtons from 'src/components/Prescription/PrescriptionSubstancesModal/PrescriptionSubstancesModalButtons';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import RemoveMatrix from 'src/views/ProgrammingView/ProgrammingPrescriptionList/RemoveMatrix';
import PrescriptionProgrammingInstruction from '../PrescriptionProgrammingInstruction/PrescriptionProgrammingInstruction';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan?: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescriptions: RegionalPrescription[];
  onChangeRegionalPrescriptionCount: (region: Region, value: number) => void;
  onRemovePrescription: (prescriptionId: string) => Promise<void>;
  onChangePrescriptionStages: (stages: Stage[]) => Promise<void>;
  onChangePrescriptionNotes: (note: string) => Promise<void>;
  onChangePrescriptionProgrammingInstruction: (
    instruction: string
  ) => Promise<void>;
}

const PrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescriptions,
  onChangeRegionalPrescriptionCount,
  onRemovePrescription: removeMatrix,
  onChangePrescriptionStages,
  onChangePrescriptionNotes,
  onChangePrescriptionProgrammingInstruction
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  if (!programmingPlan) {
    return <></>;
  }

  return (
    <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
      <div className={cx('fr-card__body')}>
        <div className={cx('fr-card__content')}>
          <div
            className={clsx(
              cx('fr-text--xs', 'fr-mb-1w'),
              'd-flex-align-center'
            )}
          >
            {uniq([
              ProgrammingPlanDomainLabels[programmingPlan.domain],
              programmingPlan.title,
              ProgrammingPlanKindLabels[prescription.programmingPlanKind],
              MatrixKindLabels[prescription.matrixKind]
            ]).map((part, idx, arr) => (
              <span key={idx}>
                {part}
                {idx < arr.length - 1 && (
                  <span
                    className={cx('fr-icon-arrow-right-s-line', 'fr-icon--sm')}
                  ></span>
                )}
              </span>
            ))}
          </div>
          <div className={clsx(cx('fr-mb-3w'), 'd-flex-align-center')}>
            <h3 className={cx('fr-card__title')}>
              {MatrixKindLabels[prescription.matrixKind]}
            </h3>
            <span>
              {t('plannedSample', {
                count: sumBy(regionalPrescriptions, 'sampleCount')
              })}
            </span>
            {hasUserPrescriptionPermission(programmingPlan)?.delete && (
              <div className={cx('fr-ml-3w')}>
                <RemoveMatrix
                  matrixKind={prescription.matrixKind}
                  stages={prescription.stages}
                  onRemove={() => removeMatrix(prescription.id)}
                />
              </div>
            )}
          </div>
          <hr className={cx('fr-mb-3w')} />
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-md-5')}>
              <Tabs
                tabs={[
                  {
                    label: 'Analyses',
                    content: (
                      <PrescriptionSubstancesModalButtons
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                      />
                    )
                  },
                  {
                    iconId:
                      prescription.stages.length > 0
                        ? 'fr-icon-check-line'
                        : undefined,
                    label: pluralize(prescription.stages.length)('Stade'),
                    content: (
                      <PrescriptionStages
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        label={`${pluralize(prescription.stages.length)('Stade')} de prélèvement`}
                        onChangeStages={onChangePrescriptionStages}
                      />
                    )
                  },
                  {
                    iconId:
                      (prescription.notes ?? '').length > 0
                        ? 'fr-icon-quote-line'
                        : undefined,
                    label: 'Note',
                    content: (
                      <PrescriptionNotes
                        programmingPlan={programmingPlan}
                        value={prescription.notes ?? ''}
                        onSubmitNotes={onChangePrescriptionNotes}
                      />
                    )
                  }
                ]}
                classes={{
                  panel: 'fr-p-3w'
                }}
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-md-7')}>
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                matrixKind={prescription.matrixKind}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalCount={onChangeRegionalPrescriptionCount}
                start={0}
                end={RegionList.length / 2}
              />
              <PrescriptionCardPartialTable
                programmingPlan={programmingPlan}
                matrixKind={prescription.matrixKind}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalCount={onChangeRegionalPrescriptionCount}
                start={RegionList.length / 2}
              />
              <PrescriptionProgrammingInstruction
                programmingPlan={programmingPlan}
                value={prescription.programmingInstruction ?? ''}
                onSubmitInstruction={onChangePrescriptionProgrammingInstruction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
