import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Brand } from 'maestro-shared/constants';
import { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import {
  getLaboratoryFullName,
  type Laboratory
} from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  type SubstanceKind,
  SubstanceKindLabels
} from 'maestro-shared/schema/Substance/SubstanceKind';
import type React from 'react';
import { useState } from 'react';
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
  programmingSubPlanNumber?: string;
  itemsLaboratories: {
    itemNumber: number;
    substanceKinds: SubstanceKind[];
    laboratory: Laboratory;
  }[];
  onConfirm: () => Promise<void>;
}

const SendingModal = ({
  modal,
  itemsLaboratories,
  programmingSubPlanNumber,
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
        itemsLaboratories.length,
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
      {itemsLaboratories.map((itemLaboratory, index) => (
        <div key={itemLaboratory.itemNumber}>
          {index > 0 && <hr className={cx('fr-my-2w')} />}
          La demande d’analyse{' '}
          {itemLaboratory.substanceKinds
            .map((substanceKind) =>
              SubstanceKindLabels[substanceKind].toLowerCase()
            )
            .join(', ')}{' '}
          va être envoyée au laboratoire{' '}
          <b>{getLaboratoryFullName(itemLaboratory.laboratory)}</b>.
          {programmingSubPlanNumber === 'PPV' &&
            !(LaboratoryWithAutomation as string[]).includes(
              itemLaboratory.laboratory.shortName
            ) && (
              <Alert
                className={cx('fr-mt-2w')}
                severity="info"
                small={true}
                description={
                  <>
                    Le processus d’automatisation est en cours pour le
                    laboratoire{' '}
                    <b>{getLaboratoryFullName(itemLaboratory.laboratory)}</b>.
                    Les résultats d’analyses restent à renseigner manuellement
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
