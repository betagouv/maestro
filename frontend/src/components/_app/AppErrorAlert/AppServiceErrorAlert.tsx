import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { isErrorWithMessage } from '../../../services/api.service';

interface Props {
  call: {
    isError: boolean;
    error?: any;
  };
}

const AppServiceErrorAlert = ({ call }: Props) => {
  if (!call.isError) {
    return <></>;
  }

  return (
    <Alert
      severity="error"
      className={cx('fr-mb-2w')}
      small={true}
      description={
        isErrorWithMessage(call.error)
          ? call.error.data
          : 'Une erreur est survenue, veuillez réessayer.'
      }
    />
  );
};

export default AppServiceErrorAlert;
