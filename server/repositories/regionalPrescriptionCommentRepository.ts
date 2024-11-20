import { RegionalPrescriptionComment } from '../../shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import db from './db';

export const regionalPrescriptionCommentsTable =
  'regional_prescription_comments';

export const RegionalPrescriptionComments = () =>
  db<RegionalPrescriptionComment>(regionalPrescriptionCommentsTable);

const insert = async (
  prescriptionComment: RegionalPrescriptionComment
): Promise<void> => {
  console.info('Insert prescription comment', prescriptionComment.id);
  await RegionalPrescriptionComments().insert(prescriptionComment);
};

export default {
  insert,
};