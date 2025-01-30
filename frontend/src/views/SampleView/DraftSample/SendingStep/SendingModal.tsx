import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React, { useState } from 'react';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
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
  laboratory: Laboratory;
  onConfirm: () => Promise<void>;
}

const SendingModal = ({ modal, laboratory, onConfirm }: Props) => {
  const [isConfirmationPending, setIsConfirmationPending] = useState(false);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsConfirmationPending(true);
    await onConfirm();
    modal.close();
    setIsConfirmationPending(false);
  };

  return (
    <modal.Component
      title="Vous vous apprêtez à envoyer un prélèvement"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          disabled: isConfirmationPending,
        },
        {
          children: "Confirmer l'envoi",
          onClick: submit,
          disabled: isConfirmationPending,
          doClosesModal: false,
        },
      ]}
    >
      La demande d’analyse va être envoyée au laboratoire{' '}
      <b>{laboratory.name}</b> par e-mail à l’adresse <b>{laboratory.email}</b>.
    </modal.Component>
  );
};

export default SendingModal;
