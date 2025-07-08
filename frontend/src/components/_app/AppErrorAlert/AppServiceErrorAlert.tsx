import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { HttpError } from 'maestro-shared/errors/httpError';
import { z } from 'zod/v4';

type Props =
  | {
      call: {
        isError: boolean;
        error?: unknown;
      };
      message?: never;
    }
  | { message: string; call?: never };

function isErrorWithMessage(error: unknown): error is { data: HttpError } {
  return z
    .object({
      status: z.number(),
      data: z.object({
        name: z.string(),
        message: z.string()
      })
    })
    .safeParse(error).success;
}

const AppServiceErrorAlert = ({ call, message }: Props) => {
  if (!call?.isError && !message) {
    return <></>;
  }

  return (
    <Alert
      severity="error"
      className={cx('fr-mb-2w')}
      small={true}
      description={
        message
          ? message
          : isErrorWithMessage(call?.error)
            ? call.error.data.message
            : 'Une erreur est survenue, veuillez réessayer.'
      }
    />
  );
};

export default AppServiceErrorAlert;
