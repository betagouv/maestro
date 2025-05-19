import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Brand } from 'maestro-shared/constants';
import { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import React, { useState } from 'react';
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
          disabled: isConfirmationPending
        },
        {
          children: "Confirmer l'envoi",
          onClick: submit,
          disabled: isConfirmationPending,
          doClosesModal: false
        }
      ]}
    >
      La demande d’analyse va être envoyée au laboratoire{' '}
      <b>{laboratory.name}</b> par e-mail à{' '}
      {laboratory.emails.map((email, index) => (
        <>
          <b>{email}</b>
          {index < laboratory.emails.length - 1 ? ', ' : ''}
        </>
      ))}
      .
      {!(LaboratoryWithAutomation as string[]).includes(laboratory.name) && (
        <Alert
          className={cx('fr-mt-2w')}
          severity="info"
          small={true}
          description={
            <>
              Le processus d’automatisation est en cours pour le laboratoire{' '}
              <b>{laboratory.name}</b>. Les résultats d’analyses restent à
              renseigner manuellement pour le moment dans {Brand}.
            </>
          }
        />
      )}
    </modal.Component>
  );
};

export default SendingModal;
