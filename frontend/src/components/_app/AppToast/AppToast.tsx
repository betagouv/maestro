import Alert from '@codegouvfr/react-dsfr/Alert';
import { AlertProps } from '@codegouvfr/react-dsfr/src/Alert';
import AutoClose from 'src/components/AutoClose/AutoClose';

interface Props {
  open: boolean;
  description: string;
  severity?: AlertProps.Severity;
  onClose?: () => void;
}

const AppToast = ({ open, description, severity, onClose }: Props) => {
  if (!open) {
    return <></>;
  }

  return (
    <AutoClose onClose={onClose}>
      <div className="toast">
        <Alert
          small
          description={description}
          closable
          severity={severity ?? 'success'}
        />
      </div>
    </AutoClose>
  );
};

export default AppToast;
