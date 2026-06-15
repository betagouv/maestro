import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

export const markErrorModal = createModal({
  id: 'analysis-dai-mark-error-modal',
  isOpenedByDefault: false
});

interface Props {
  message: string;
  onMessageChange: (message: string) => void;
  onConfirm: () => Promise<void>;
}

export const MarkErrorModal = ({
  message,
  onMessageChange,
  onConfirm
}: Props) => (
  <markErrorModal.Component
    title="Passer la DAI en erreur"
    concealingBackdrop={false}
    topAnchor
    buttons={[
      {
        children: 'Annuler',
        doClosesModal: true,
        priority: 'secondary'
      },
      {
        children: 'Passer en erreur',
        doClosesModal: true,
        priority: 'primary',
        disabled: message.trim().length === 0,
        onClick: onConfirm
      }
    ]}
  >
    <p>
      Cette DAI sera marquée comme étant en erreur et pourra ensuite être
      relancée.
    </p>
    <Input
      label="Message d'erreur"
      textArea
      nativeTextAreaProps={{
        rows: 3,
        value: message,
        onChange: (e) => onMessageChange(e.target.value)
      }}
    />
  </markErrorModal.Component>
);
