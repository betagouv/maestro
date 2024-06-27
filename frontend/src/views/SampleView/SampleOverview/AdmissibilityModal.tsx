import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React from 'react';
interface Props {
  modal: {
    buttonProps: {
      /** Only for analytics, feel free to overwrite */
      id: string;
      'aria-controls': string;
      'data-fr-opened': boolean;
    };
    Component: (props: ModalProps) => JSX.Element;
    close: () => void;
    open: () => void;
    isOpenedByDefault: boolean;
    id: string;
  };
  onConfirm: () => Promise<void>;
}

const AdmissibilityModal = ({ modal, onConfirm }: Props) => {
  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onConfirm();
    modal.close();
  };

  return (
    <modal.Component
      title="Confirmez que l’échantillon est non-recevable"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
        },
        {
          children: 'Confirmer',
          onClick: submit,
          doClosesModal: false,
        },
      ]}
    >
      La notification du laboratoire vous informe que l’échantillon reçu est
      non-recevable pour l’analyse.
    </modal.Component>
  );
};

export default AdmissibilityModal;
