import { v4 as uuidv4 } from 'uuid';
import { AnalysisToCreate } from '../schema/Analysis/Analysis';

export const genAnalysisToCreate = (
  data?: Partial<AnalysisToCreate>
): AnalysisToCreate => ({
  sampleId: uuidv4(),
  documentId: uuidv4(),
  ...data,
});
