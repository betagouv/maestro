import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React, { type ReactNode } from 'react';
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
  title: ReactNode;
  children: ReactNode;
  onConfirm: () => Promise<void>;
}

const ConfirmationModal = ({ modal, title, children, onConfirm }: Props) => {
  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onConfirm();
    modal.close();
  };

  return (
    <modal.Component
      title={title}
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
      {children}
    </modal.Component>
  );
};

export default ConfirmationModal;
