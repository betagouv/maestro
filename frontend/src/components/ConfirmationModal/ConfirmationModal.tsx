import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React, { type ReactNode } from 'react';
interface Props {
  modal: {
    Component: (props: ModalProps) => React.JSX.Element;
    close: () => void;
    open: () => void;
    isOpenedByDefault: boolean;
    id: string;
  };
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  closeOnConfirm?: boolean;
}

const ConfirmationModal = ({
  modal,
  title,
  children,
  confirmLabel,
  onConfirm,
  closeOnConfirm
}: Props) => {
  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onConfirm();
    if (closeOnConfirm) {
      modal.close();
    }
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
          onClick: (e) => {
            e.preventDefault();
          }
        },
        {
          children: confirmLabel ?? 'Confirmer',
          onClick: submit,
          doClosesModal: false
        }
      ]}
    >
      {children}
    </modal.Component>
  );
};

export default ConfirmationModal;
