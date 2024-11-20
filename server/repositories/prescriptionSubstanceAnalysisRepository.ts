import fp from 'lodash';
import { z } from 'zod';
import { PrescriptionSubstanceAnalysis } from '../../shared/schema/Prescription/PrescriptionSubstanceAnalysis';
import db from './db';

export const substancesTable = 'substances';
export const prescriptionSubstanceAnalysisTable =
  'prescription_substance_analysis';

const PrescriptionSubstanceAnalysisDbo = PrescriptionSubstanceAnalysis.pick({
  prescriptionId: true,
  analysisKind: true,
}).merge(z.object({ substanceCode: z.string() }));

const PrescriptionSubstanceAnalysisJoinedDbo =
  PrescriptionSubstanceAnalysisDbo.merge(
    z.object({
      substanceLabel: z.string(),
    })
  );

type PrescriptionSubstanceAnalysisDbo = z.infer<
  typeof PrescriptionSubstanceAnalysisDbo
>;
type PrescriptionSubstanceAnalysisJoinedDbo = z.infer<
  typeof PrescriptionSubstanceAnalysisJoinedDbo
>;

export const Substances = () => db(substancesTable);
export const PrescriptionSubstanceAnalysisTable = () =>
  db<PrescriptionSubstanceAnalysisDbo>(prescriptionSubstanceAnalysisTable);

const findMany = async (
  prescriptionId: string
): Promise<PrescriptionSubstanceAnalysis[]> => {
  console.info('Find prescription substances', prescriptionId);
  return PrescriptionSubstanceAnalysisTable()
    .select(
      `${prescriptionSubstanceAnalysisTable}.*`,
      `${substancesTable}.label as substanceLabel`
    )
    .join(
      substancesTable,
      `${prescriptionSubstanceAnalysisTable}.substanceCode`,
      'code'
    )
    .where({ prescriptionId })
    .then((prescriptionSubstanceAnalysis) =>
      prescriptionSubstanceAnalysis.map(parsePrescriptionSubstanceAnalysis)
    );
};

const insert = async (
  prescriptionSubstanceAnalysis: PrescriptionSubstanceAnalysis
): Promise<void> => {
  console.info(
    'Insert prescription substance',
    prescriptionSubstanceAnalysis.prescriptionId,
    prescriptionSubstanceAnalysis.substance.code
  );
  await PrescriptionSubstanceAnalysisTable().insert(
    formatPrescriptionSubstanceAnalysis(prescriptionSubstanceAnalysis)
  );
};

const deleteOne = async (
  prescriptionId: string,
  substanceCode: string
): Promise<void> => {
  console.info('Delete prescription substance', prescriptionId, substanceCode);
  await PrescriptionSubstanceAnalysisTable()
    .where({ prescriptionId, substanceCode })
    .delete();
};

export const formatPrescriptionSubstanceAnalysis = (
  prescriptionSubstanceAnalysis: PrescriptionSubstanceAnalysis
): PrescriptionSubstanceAnalysisDbo => ({
  ...fp.omit(prescriptionSubstanceAnalysis, ['substance']),
  substanceCode: prescriptionSubstanceAnalysis.substance.code,
});

export const parsePrescriptionSubstanceAnalysis = (
  prescriptionSubstanceAnalysis: PrescriptionSubstanceAnalysisJoinedDbo
): PrescriptionSubstanceAnalysis =>
  prescriptionSubstanceAnalysis &&
  PrescriptionSubstanceAnalysis.parse({
    ...fp.omit(fp.omitBy(prescriptionSubstanceAnalysis, fp.isNil), [
      'substanceCode',
      'substanceLabel',
    ]),
    substance: {
      code: prescriptionSubstanceAnalysis.substanceCode,
      label: prescriptionSubstanceAnalysis.substanceLabel,
    },
  });

export default {
  findMany,
  insert,
  deleteOne,
};