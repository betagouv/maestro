import { PrescriptionComment } from '../../shared/schema/Prescription/PrescriptionComment';
import db from './db';

export const prescriptionCommentsTable = 'prescription_comments';

export const PrescriptionComments = () =>
  db<PrescriptionComment>(prescriptionCommentsTable);

const insert = async (
  prescriptionComment: PrescriptionComment
): Promise<void> => {
  console.info('Insert prescription comment', prescriptionComment.id);
  await PrescriptionComments().insert(prescriptionComment);
};

export default {
  insert,
};
