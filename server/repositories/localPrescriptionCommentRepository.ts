import { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { knexInstance as db } from './db';

export const localPrescriptionCommentsTable = 'local_prescription_comments';

export const LocalPrescriptionComments = () =>
  db<LocalPrescriptionComment>(localPrescriptionCommentsTable);

const insert = async (
  prescriptionComment: LocalPrescriptionComment
): Promise<void> => {
  console.info('Insert prescription comment', prescriptionComment.id);
  await LocalPrescriptionComments().insert(prescriptionComment);
};

export default {
  insert
};
