import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useEffect, useState } from 'react';
import LaboratorySelect from 'src/components/LaboratorySelect/LaboratorySelect';

interface Props {
  programmingPlanId: string;
  commonSlots: SubstanceKindLaboratory[];
  onSubmit: (substanceKindsLaboratories: SubstanceKindLaboratory[]) => void;
}

export const bulkAssignLaboratoriesModal = createModal({
  id: 'bulk-assign-laboratories-modal',
  isOpenedByDefault: false
});

const BulkAssignLaboratoriesModal = ({
  programmingPlanId,
  commonSlots,
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
      {isOpen && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            Définissez le laboratoire destinataire des prélèvements{' '}
            {substanceKindsLaboratories.length > 1 && <>par type d’analyse</>}
          </div>
          {substanceKindsLaboratories.map((skl, index) => (
            <div
              className={cx('fr-col-12')}
              key={`bulk-assign-${skl.substanceKind}`}
            >
              {index > 0 && <hr className={cx('fr-mb-2w')} />}
              <div className={cx('fr-text--bold', 'fr-mb-2w')}>
                {SubstanceKindLabels[skl.substanceKind]}
              </div>
              <LaboratorySelect
                programmingPlanId={programmingPlanId}
                substanceKind={skl.substanceKind}
                laboratoryId={skl.laboratoryId}
                onSelect={(laboratoryId) =>
                  setSubstanceKindsLaboratories((prev) =>
                    prev.map((s) =>
                      s.substanceKind === skl.substanceKind
                        ? { ...s, laboratoryId }
                        : s
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
