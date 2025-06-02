import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

interface Props {
  call: {
    isError: boolean;
    error?: unknown;
  };
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'data' property
 */
function isErrorWithMessage(error: unknown): error is { data: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'data' in error &&
    typeof (error as any).data === 'string'
  );
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
