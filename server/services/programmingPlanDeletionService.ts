import { constants } from 'node:http2';
import { HttpError } from 'maestro-shared/errors/httpError';

const conflict = (message: string) =>
  new HttpError({
    status: constants.HTTP_STATUS_CONFLICT,
    name: 'ProgrammingPlanDeletionConflictError',
    message
  });

const isForeignKeyViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23503';

const settingsCompletedConflict = () =>
  conflict('Suppression impossible : le paramétrage est terminé.');

const deleteOrConflict = async (
  deletion: () => Promise<void>
): Promise<void> => {
  try {
    await deletion();
  } catch (error) {
    if (!isForeignKeyViolation(error)) {
      throw error;
    }

    throw conflict(
      'Suppression impossible : des prescriptions ou des prélèvements y sont rattachés.'
    );
  }
};

export const programmingPlanDeletionService = {
  settingsCompletedConflict,
  deleteOrConflict
};
