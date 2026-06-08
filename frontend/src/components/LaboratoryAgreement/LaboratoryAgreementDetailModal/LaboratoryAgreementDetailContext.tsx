import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { LaboratoryAgreement } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type React from 'react';
import { createContext, useRef, useState } from 'react';
import LaboratoryAgreementDetailModal from './LaboratoryAgreementDetailModal';

const modal = createModal({
  id: 'lab-agreement-detail-modal',
  isOpenedByDefault: false
});

type OpenLaboratoryAgreementDetail = (
  laboratoryAgreement: LaboratoryAgreement,
  laboratory: Laboratory,
  programmingSubPlan: ProgrammingSubPlan,
  afterClose?: () => void
) => void;

export const LaboratoryAgreementDetailContext =
  createContext<OpenLaboratoryAgreementDetail | null>(null);

interface Props {
  children: React.ReactNode;
  onSave?: (updated: LaboratoryAgreement) => Promise<void>;
  onOpen?: () => void;
  onConceal?: () => void;
}

export const LaboratoryAgreementDetailProvider = ({
  children,
  onSave,
  onOpen,
  onConceal
}: Props) => {
  const [laboratoryAgreement, setLaboratoryAgreement] =
    useState<LaboratoryAgreement | null>(null);
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);
  const [programmingSubPlan, setProgrammingSubPlan] =
    useState<ProgrammingSubPlan | null>(null);
  const afterCloseCallback = useRef<(() => void) | undefined>(undefined);

  useIsModalOpen(modal, {
    onConceal: () => {
      const cb = afterCloseCallback.current;
      afterCloseCallback.current = undefined;
      onConceal?.();
      cb?.();
    }
  });

  const openLaboratoryAgreementDetail: OpenLaboratoryAgreementDetail = (
    agreement,
    laboratory,
    programmingSubPlan,
    afterClose
  ) => {
    setLaboratoryAgreement(agreement);
    setLaboratory(laboratory);
    setProgrammingSubPlan(programmingSubPlan);
    afterCloseCallback.current = afterClose;
    onOpen?.();
    modal.open();
  };

  return (
    <LaboratoryAgreementDetailContext.Provider
      value={openLaboratoryAgreementDetail}
    >
      {children}
      <LaboratoryAgreementDetailModal
        modal={modal}
        laboratoryAgreement={laboratoryAgreement}
        laboratory={laboratory}
        programmingSubPlan={programmingSubPlan}
        onSave={onSave}
      />
    </LaboratoryAgreementDetailContext.Provider>
  );
};
