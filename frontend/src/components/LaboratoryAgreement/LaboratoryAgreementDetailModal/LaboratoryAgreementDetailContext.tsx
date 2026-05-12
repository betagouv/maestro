import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { LaboratoryAgreement } from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type React from 'react';
import { createContext, useContext, useState } from 'react';
import LaboratoryAgreementDetailModal from './LaboratoryAgreementDetailModal';

const modal = createModal({
  id: 'lab-agreement-detail-modal',
  isOpenedByDefault: false
});

export type OpenLaboratoryAgreementDetail = (
  laboratoryAgreement: LaboratoryAgreement,
  laboratory: Laboratory
) => void;

export const LaboratoryAgreementDetailContext =
  createContext<OpenLaboratoryAgreementDetail | null>(null);

interface Props {
  children: React.ReactNode;
  onSave?: (updated: LaboratoryAgreement) => Promise<void>;
}

export const LaboratoryAgreementDetailProvider = ({
  children,
  onSave
}: Props) => {
  const [laboratoryAgreement, setLaboratoryAgreement] =
    useState<LaboratoryAgreement | null>(null);
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);

  const openLaboratoryAgreementDetail: OpenLaboratoryAgreementDetail = (
    agreement,
    lab
  ) => {
    setLaboratoryAgreement(agreement);
    setLaboratory(lab);
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
