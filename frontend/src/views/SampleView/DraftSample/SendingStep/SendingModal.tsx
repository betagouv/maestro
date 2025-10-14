import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Brand } from 'maestro-shared/constants';
import { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import {
  getLaboratoryFullName,
  Laboratory
} from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  SubstanceKind,
  SubstanceKindLabels
} from 'maestro-shared/schema/Substance/SubstanceKind';
import React, { useState } from 'react';
import { pluralize } from '../../../../utils/stringUtils';
interface Props {
  modal: {
    buttonProps: {
      /** Only for analytics, feel free to overwrite */
      id: string;
      'aria-controls': string;
      'data-fr-opened': boolean;
    };
    Component: (props: ModalProps) => React.JSX.Element;
    close: () => void;
    open: () => void;
    isOpenedByDefault: boolean;
    id: string;
  };
  substanceKindsLaboratories: {
    substanceKind: SubstanceKind;
    laboratory: Laboratory;
  }[];
  onConfirm: () => Promise<void>;
}

const SendingModal = ({
  modal,
  substanceKindsLaboratories,
  onConfirm
}: Props) => {
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
      title={`Vous vous apprêtez à envoyer ${pluralize(
        substanceKindsLaboratories.length,
        {
          preserveCount: true
        }
      )('prélèvement')}`}
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
      {substanceKindsLaboratories.map((substanceKindLaboratory, index) => (
        <div key={substanceKindLaboratory.substanceKind}>
          {index > 0 && <hr className={cx('fr-my-2w')} />}
          La demande d’
          {SubstanceKindLabels[
            substanceKindLaboratory.substanceKind
          ].toLowerCase()}{' '}
          va être envoyée au laboratoire{' '}
          <b>{getLaboratoryFullName(substanceKindLaboratory.laboratory)}</b> par
          e-mail à{' '}
          {substanceKindLaboratory.laboratory.emails.map((email, index) => (
            <span key={`email-${index}`}>
              <b>{email}</b>
              {index < substanceKindLaboratory.laboratory.emails.length - 1
                ? ', '
                : ''}
            </span>
          ))}
          .
          {!(LaboratoryWithAutomation as string[]).includes(
            substanceKindLaboratory.laboratory.shortName
          ) && (
            <Alert
              className={cx('fr-mt-2w')}
              severity="info"
              small={true}
              description={
                <>
                  Le processus d’automatisation est en cours pour le laboratoire{' '}
                  <b>
                    {getLaboratoryFullName(substanceKindLaboratory.laboratory)}
                  </b>
                  . Les résultats d’analyses restent à renseigner manuellement
                  pour le moment dans {Brand}.
                </>
              }
            />
          )}
        </div>
      ))}
    </modal.Component>
  );
};

export default SendingModal;
