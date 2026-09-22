import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import type { ProgrammingPlanSampleSetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useEffect, useState } from 'react';
import LaboratorySelect from 'src/components/LaboratorySelect/LaboratorySelect';
import {
  assignSampleLaboratory,
  groupSubstanceKindsLaboratoriesBySample
} from 'src/utils/sampleLaboratories';

interface Props {
  programmingSubPlanIds: ProgrammingSubPlanId[];
  commonSlots: SubstanceKindLaboratory[];
  samples: Pick<ProgrammingPlanSampleSetting, 'substanceKinds'>[];
  onSubmit: (substanceKindsLaboratories: SubstanceKindLaboratory[]) => void;
}

export const bulkAssignLaboratoriesModal = createModal({
  id: 'bulk-assign-laboratories-modal',
  isOpenedByDefault: false
});

const BulkAssignLaboratoriesModal = ({
  programmingSubPlanIds,
  commonSlots,
  samples,
  onSubmit
}: Props) => {
  const isOpen = useIsModalOpen(bulkAssignLaboratoriesModal);
  const [substanceKindsLaboratories, setSubstanceKindsLaboratories] =
    useState<SubstanceKindLaboratory[]>(commonSlots);

  useEffect(() => {
    if (isOpen) {
      setSubstanceKindsLaboratories(commonSlots);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const sampleLaboratories = groupSubstanceKindsLaboratoriesBySample(
    samples,
    substanceKindsLaboratories
  );

  return (
    <bulkAssignLaboratoriesModal.Component
      title="Attribuer les laboratoires"
      buttons={[
        { children: 'Annuler', priority: 'secondary' },
        {
          children: 'Valider',
          onClick: () => onSubmit(substanceKindsLaboratories),
          doClosesModal: false
        }
      ]}
    >
      {isOpen && programmingSubPlanIds.length > 0 && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            Définissez le laboratoire destinataire des prélèvements{' '}
            {sampleLaboratories.length > 1 && <>par échantillon</>}
          </div>
          {sampleLaboratories.map((sampleLaboratory, index) => (
            <div
              className={cx('fr-col-12')}
              key={`bulk-assign-${sampleLaboratory.substanceKinds.join('_')}`}
            >
              {index > 0 && <hr className={cx('fr-mb-2w')} />}
              <div className={cx('fr-text--bold', 'fr-mb-2w')}>
                {sampleLaboratory.substanceKinds
                  .map((substanceKind) => SubstanceKindLabels[substanceKind])
                  .join(', ')}
              </div>
              <LaboratorySelect
                programmingPlanId={undefined}
                programmingSubPlanIds={programmingSubPlanIds}
                substanceKinds={sampleLaboratory.substanceKinds}
                noOptionsMessage="L’action groupée n’est pas possible sur cet échantillon car les sous-plans n’ont aucun laboratoire agréé en commun."
                laboratoryId={sampleLaboratory.laboratoryId}
                onSelect={(laboratoryId) =>
                  setSubstanceKindsLaboratories((prev) =>
                    assignSampleLaboratory(
                      prev,
                      sampleLaboratory.substanceKinds,
                      laboratoryId
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </bulkAssignLaboratoriesModal.Component>
  );
};

export default BulkAssignLaboratoriesModal;
