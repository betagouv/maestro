import Alert from '@codegouvfr/react-dsfr/Alert';
import type { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import AutoClose from 'src/components/AutoClose/AutoClose';

interface Props {
  open: boolean;
  description: string;
  severity?: AlertProps.Severity;
  onClose?: () => void;
  autoClose?: boolean;
}

const AppToast = ({
  open,
  description,
  severity,
  onClose,
  autoClose = true
}: Props) => {
  if (!open) {
    return null;
  }

  const alert = (
    <div className="toast">
      <Alert
        small
        description={description}
        closable
        onClose={onClose}
        severity={severity ?? 'success'}
      />
    </div>
  );

  return autoClose ? <AutoClose onClose={onClose}>{alert}</AutoClose> : alert;
};

export default AppToast;
