import { RegionalPrescriptionComment } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import {knexInstance as db} from './db';

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
