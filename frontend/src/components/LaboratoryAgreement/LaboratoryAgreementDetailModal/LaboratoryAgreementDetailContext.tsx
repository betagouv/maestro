import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { LaboratoryAgreement } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
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
  const afterCloseCallback = useRef<(() => void) | undefined>(undefined);

  useIsModalOpen(modal, {
    onConceal: () => {
      const cb = afterCloseCallback.current;
      afterCloseCallback.current = undefined;
      onConceal?.();
      cb?.();
    }
  });

  useIsModalOpen(modal, {
    onConceal
  });

  const openLaboratoryAgreementDetail: OpenLaboratoryAgreementDetail = (
    agreement,
    lab,
    afterClose
  ) => {
    setLaboratoryAgreement(agreement);
    setLaboratory(lab);
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
        onSave={onSave}
      />
    </LaboratoryAgreementDetailContext.Provider>
  );
};
