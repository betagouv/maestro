import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import { Region, RegionList } from 'maestro-shared/referential/Region';
import { Stage } from 'maestro-shared/referential/Stage';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  getPrescriptionTitle,
  Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useState } from 'react';
import PrescriptionDistributionTable from 'src/components/Prescription/PrescriptionDistributionTable/PrescriptionDistributionTable';
import PrescriptionNotes from 'src/components/Prescription/PrescriptionNotes/PrescriptionNotes';
import PrescriptionStages from 'src/components/Prescription/PrescriptionStages/PrescriptionStages';
import PrescriptionSubstances from 'src/components/Prescription/PrescriptionSubstances/PrescriptionSubstances';
import RemovePrescriptionModal from 'src/components/Prescription/RemovePrescriptionModal/RemovePrescriptionModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { pluralize } from 'src/utils/stringUtils';
import PrescriptionBreadcrumb from '../PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import PrescriptionProgrammingInstruction from '../PrescriptionProgrammingInstruction/PrescriptionProgrammingInstruction';
import './PrescriptionCard.scss';

interface Props {
  programmingPlan?: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescriptions: LocalPrescription[];
  onChangeLocalPrescriptionCount: (region: Region, value: number) => void;
  onRemovePrescription: (prescriptionId: string) => Promise<void>;
  onChangePrescriptionStages: (stages: Stage[]) => Promise<void>;
  onChangePrescriptionNotes: (note: string) => Promise<void>;
  onChangePrescriptionProgrammingInstruction: (
    instruction: string
  ) => Promise<void>;
}

type PrescriptionCardTab = 'AnalysesTab' | 'StagesTab' | 'NotesTab';

const PrescriptionCard = ({
  programmingPlan,
  prescription,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount,
  onRemovePrescription: removeMatrix,
  onChangePrescriptionStages,
  onChangePrescriptionNotes,
  onChangePrescriptionProgrammingInstruction
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  const [selectedTabId, setSelectedTabId] =
    useState<PrescriptionCardTab>('AnalysesTab');

  if (!programmingPlan) {
    return <></>;
  }

  return (
    <div className={clsx(cx('fr-card', 'fr-card--sm'), 'prescription-card')}>
      <div className={cx('fr-card__body')}>
        <div className={cx('fr-card__content')}>
          <PrescriptionBreadcrumb
            prescription={prescription}
            programmingPlan={programmingPlan}
          />
          <div className={clsx(cx('fr-mb-3w'), 'd-flex-align-center')}>
            <h3 className={cx('fr-card__title')}>
              {getPrescriptionTitle(prescription)}
            </h3>
            <span>
              {t('plannedSample', {
                count: sumBy(regionalPrescriptions, 'sampleCount')
              })}
            </span>
            {hasUserPrescriptionPermission(programmingPlan)?.delete && (
              <div className={cx('fr-ml-3w')}>
                <RemovePrescriptionModal
                  prescription={prescription}
                  onRemove={() => removeMatrix(prescription.id)}
                />
              </div>
            )}
          </div>
          <hr className={cx('fr-mb-3w')} />
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-col-md-5')}>
              <Tabs
                selectedTabId={selectedTabId}
                onTabChange={(tabId) =>
                  setSelectedTabId(tabId as PrescriptionCardTab)
                }
                tabs={[
                  {
                    label: 'Analyses',
                    tabId: 'AnalysesTab'
                  },
                  {
                    iconId:
                      prescription.stages.length > 0
                        ? 'fr-icon-check-line'
                        : undefined,
                    label: pluralize(prescription.stages.length)('Stade'),
                    tabId: 'StagesTab'
                  },
                  {
                    iconId:
                      (prescription.notes ?? '').length > 0
                        ? 'fr-icon-quote-line'
                        : undefined,
                    label: 'Note',
                    tabId: 'NotesTab'
                  }
                ]}
                classes={{
                  panel: 'fr-p-3w'
                }}
              >
                {selectedTabId === 'AnalysesTab' && (
                  <PrescriptionSubstances
                    programmingPlan={programmingPlan}
                    prescription={prescription}
                    renderMode="modal"
                  />
                )}
                {selectedTabId === 'StagesTab' && (
                  <PrescriptionStages
                    programmingPlan={programmingPlan}
                    prescription={prescription}
                    label={`${pluralize(prescription.stages.length)('Stade')} de prélèvement`}
                    onChangeStages={onChangePrescriptionStages}
                  />
                )}
                {selectedTabId === 'NotesTab' && (
                  <PrescriptionNotes
                    programmingPlan={programmingPlan}
                    value={prescription.notes ?? ''}
                    onSubmitNotes={onChangePrescriptionNotes}
                  />
                )}
              </Tabs>
            </div>
            <div className={cx('fr-col-12', 'fr-col-md-7')}>
              <PrescriptionDistributionTable
                programmingPlan={programmingPlan}
                prescription={prescription}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalCount={onChangeLocalPrescriptionCount}
                start={0}
                end={RegionList.length / 2}
              />
              <PrescriptionDistributionTable
                programmingPlan={programmingPlan}
                prescription={prescription}
                regionalPrescriptions={regionalPrescriptions}
                onChangeRegionalCount={onChangeLocalPrescriptionCount}
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
