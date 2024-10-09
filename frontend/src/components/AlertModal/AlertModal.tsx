import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { type ReactNode } from 'react';
interface Props {
  modal: {
    Component: (props: ModalProps) => JSX.Element;
    close: () => void;
    open: () => void;
    isOpenedByDefault: boolean;
    id: string;
  };
  title: ReactNode;
  children?: ReactNode;
  closeLabel?: string;
}

const AlertModal = ({ modal, title, children, closeLabel }: Props) => {
  return (
    <modal.Component
      title={title}
      iconId={'fr-icon-alert-line'}
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: closeLabel ?? 'Fermer',
          priority: 'secondary',
          onClick: (e) => {
            e.preventDefault();
          },
        },
      ]}
    >
      {children}
    </modal.Component>
  );
};

export default AlertModal;
