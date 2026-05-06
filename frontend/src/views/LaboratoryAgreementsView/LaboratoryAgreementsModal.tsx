import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  AgreementUpdate,
  LaboratoryAgreement
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import type React from 'react';
import { useEffect, useState } from 'react';
import LaboratoryAgreementButton from '../../components/LaboratoryAgreement/LaboratoryAgreementButton/LaboratoryAgreementButton';
import LaboratoryAgreementTag from '../../components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import './LaboratoryAgreementsModal.scss';
import clsx from 'clsx';

export type ModalInstance = {
  Component: (props: ModalProps) => React.JSX.Element;
  close: () => void;
  open: () => void;
  isOpenedByDefault: boolean;
  id: string;
};

type LocalAgreement = {
  referenceLaboratory: boolean;
  detectionAnalysis: boolean;
  confirmationAnalysis: boolean;
};

export type AgreementsGroup = {
  programmingPlanId: string;
  programmingPlanKind: string;
  substanceKind: string;
};

export interface Props {
  modal: ModalInstance;
  selectedGroup: AgreementsGroup | null;
  agreements: LaboratoryAgreement[];
  laboratories: Laboratory[];
  onSave: (input: {
    programmingPlanId: string;
    programmingPlanKind: ProgrammingPlanKind;
    substanceKind: SubstanceKind;
    agreements: AgreementUpdate[];
  }) => Promise<void>;
}

const defaultLocalAgreement: LocalAgreement = {
  referenceLaboratory: false,
  detectionAnalysis: false,
  confirmationAnalysis: false
};

const LaboratoryAgreementsModal = ({
  modal,
  selectedGroup,
  agreements,
  laboratories,
  onSave
}: Props) => {
  const [localAgreements, setLocalAgreements] = useState<
    Record<string, LocalAgreement>
  >({});

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    const initial = Object.fromEntries(
      agreements
        .filter(
          (a) =>
            a.programmingPlanId === selectedGroup.programmingPlanId &&
            a.substanceKind === selectedGroup.substanceKind
        )
        .map((a) => [
          a.laboratoryId,
          {
            referenceLaboratory: a.referenceLaboratory,
            detectionAnalysis: a.detectionAnalysis,
            confirmationAnalysis: a.confirmationAnalysis
          }
        ])
    );
    setLocalAgreements(initial);
  }, [selectedGroup, agreements]);

  const toggle = (labId: string, field: keyof LocalAgreement) => {
    setLocalAgreements((prev) => ({
      ...prev,
      [labId]: {
        ...defaultLocalAgreement,
        ...prev[labId],
        [field]: !(prev[labId]?.[field] ?? false)
      }
    }));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      return;
    }
    const agreementsToSave = Object.entries(localAgreements)
      .filter(
        ([, v]) =>
          v.referenceLaboratory || v.detectionAnalysis || v.confirmationAnalysis
      )
      .map(([laboratoryId, v]) => ({ laboratoryId, ...v }));

    await onSave({
      programmingPlanId: selectedGroup.programmingPlanId,
      programmingPlanKind:
        selectedGroup.programmingPlanKind as ProgrammingPlanKind,
      substanceKind: selectedGroup.substanceKind as SubstanceKind,
      agreements: agreementsToSave
    });
    modal.close();
  };

  return (
    <modal.Component
      title="Affecter les laboratoires"
      concealingBackdrop={false}
      size="large"
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          doClosesModal: true
        },
        {
          children: 'Enregistrer',
          onClick: handleSave,
          doClosesModal: false
        }
      ]}
    >
      <div className="agreement-modal">
        <div className={cx('fr-pr-3w')}>
          {laboratories.map((laboratory, index) => {
            const localAgreement =
              localAgreements[laboratory.id] ?? defaultLocalAgreement;
            return (
              <div key={laboratory.id}>
                {index > 0 && <hr className={cx('fr-my-1w')} />}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <span className={cx('fr-text--bold')}>
                      {laboratory.shortName}
                    </span>
                    <br />
                    <span className={cx('fr-text--sm')}>{laboratory.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <LaboratoryAgreementButton
                      field="referenceLaboratory"
                      active={localAgreement.referenceLaboratory}
                      onToggle={() =>
                        toggle(laboratory.id, 'referenceLaboratory')
                      }
                    />
                    <LaboratoryAgreementButton
                      field="detectionAnalysis"
                      active={localAgreement.detectionAnalysis}
                      onToggle={() =>
                        toggle(laboratory.id, 'detectionAnalysis')
                      }
                    />
                    <LaboratoryAgreementButton
                      field="confirmationAnalysis"
                      active={localAgreement.confirmationAnalysis}
                      onToggle={() =>
                        toggle(laboratory.id, 'confirmationAnalysis')
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={clsx(cx('fr-p-3w'), 'agreement-modal-selection')}>
          {laboratories
            .filter((laboratory) => {
              const local = localAgreements[laboratory.id];
              return (
                local &&
                (local.referenceLaboratory ||
                  local.detectionAnalysis ||
                  local.confirmationAnalysis)
              );
            })
            .map((laboratory) => {
              const local = localAgreements[laboratory.id];
              return (
                <LaboratoryAgreementTag
                  key={laboratory.id}
                  shortName={laboratory.shortName}
                  referenceLaboratory={local.referenceLaboratory}
                  detectionAnalysis={local.detectionAnalysis}
                  confirmationAnalysis={local.confirmationAnalysis}
                  onToggle={(field) => toggle(laboratory.id, field)}
                />
              );
            })}
        </div>
      </div>
    </modal.Component>
  );
};

export default LaboratoryAgreementsModal;
