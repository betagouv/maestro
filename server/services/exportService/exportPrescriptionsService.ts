import exceljs from 'exceljs';
import highland from 'highland';
import _ from 'lodash';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import {
  Region,
  RegionList,
  Regions,
} from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { Prescription } from '../../../shared/schema/Prescription/Prescription';
import {
  genPrescriptionByMatrix,
  matrixCompletionRate,
} from '../../../shared/schema/Prescription/PrescriptionsByMatrix';
import { ProgrammingPlan } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import { isDefined } from '../../../shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import sampleRepository from '../../repositories/sampleRepository';
import WorkbookWriter = exceljs.stream.xlsx.WorkbookWriter;

interface PrescriptionWorkbookData {
  prescriptions: Prescription[];
  programmingPlan: ProgrammingPlan;
  exportedRegion: Region | undefined;
}

const writeToWorkbook = async (
  { prescriptions, programmingPlan, exportedRegion }: PrescriptionWorkbookData,
  workbook: WorkbookWriter
) => {
  const samples = await sampleRepository.findMany({
    programmingPlanId: programmingPlan.id,
    status: 'Sent',
  });

  const exportedRegions = exportedRegion ? [exportedRegion] : RegionList;

  const prescriptionsByMatrix = genPrescriptionByMatrix(
    prescriptions,
    samples,
    exportedRegions
  );

  const laboratories = exportedRegion
    ? await laboratoryRepository.findMany()
    : [];

  const worksheet = workbook.addWorksheet('Prescriptions');
  worksheet.columns = [
    { header: 'Matrice', key: 'matrix', width: 30 },
    { header: 'Stade(s) de prélèvement', key: 'stages', width: 20 },
    !exportedRegion
      ? {
          header: 'Total national\nProgrammés',
          key: 'sampleTotalCount',
          width: 15,
        }
      : undefined,
    !exportedRegion && programmingPlan.status === 'Validated'
      ? {
          header: 'Total national\nRéalisés',
          key: 'sentSampleTotalCount',
          width: 15,
        }
      : undefined,
    !exportedRegion && programmingPlan.status === 'Validated'
      ? {
          header: 'Total national\nTaux de réalisation',
          key: 'completionRate',
          width: 15,
        }
      : undefined,
    ...exportedRegions.map((region) => [
      {
        header: `${Regions[region].shortName}\nProgrammés`,
        key: `sampleCount-${region}`,
        width: 10,
      },
      programmingPlan.status === 'Validated'
        ? {
            header: `${Regions[region].shortName}\nRéalisés`,
            key: `sentSampleCount-${region}`,
            width: 10,
          }
        : undefined,
      programmingPlan.status === 'Validated'
        ? {
            header: `${Regions[region].shortName}\nTaux de réalisation`,
            key: `completionRate-${region}`,
            width: 10,
          }
        : undefined,
    ]),
    exportedRegion
      ? {
          header: 'Laboratoire',
          key: 'laboratory',
          width: 20,
        }
      : undefined,
  ]
    .flat()
    .filter(isDefined);

  highland(prescriptionsByMatrix)
    .each((prescription) => {
      worksheet
        .addRow({
          matrix: MatrixLabels[prescription.matrix],
          stages: prescription.stages
            .map((stage) => StageLabels[stage])
            .join('\n'),
          sampleTotalCount: _.sumBy(
            prescription.regionalData,
            ({ sampleCount }) => sampleCount
          ),
          sentSampleTotalCount: _.sumBy(
            prescription.regionalData,
            ({ sentSampleCount }) => sentSampleCount
          ),
          completionRate: matrixCompletionRate(prescription),
          ...prescription.regionalData.reduce(
            (acc, { sampleCount, sentSampleCount, region }) => ({
              ...acc,
              [`sampleCount-${region}`]: sampleCount,
              [`sentSampleCount-${region}`]: sentSampleCount,
              [`completionRate-${region}`]: matrixCompletionRate(
                prescription,
                region
              ),
            }),
            {}
          ),
          laboratory: laboratories.find(
            (laboratory) =>
              laboratory.id === prescription.regionalData[0]?.laboratoryId
          )?.name,
        })
        .commit();
    })
    .done(() => {
      worksheet.addRow({
        matrix: 'Total',
        sampleTotalCount: _.sum(
          prescriptionsByMatrix
            .flatMap((p) => p.regionalData)
            .map((p) => p.sampleCount)
        ),
        sentSampleTotalCount: _.sum(
          prescriptionsByMatrix
            .flatMap((p) => p.regionalData)
            .map((p) => p.sentSampleCount)
        ),
        completionRate: matrixCompletionRate(prescriptionsByMatrix),
        ...exportedRegions.reduce(
          (acc, region) => ({
            ...acc,
            [`sampleCount-${region}`]: _.sum(
              prescriptionsByMatrix.map(
                (p) =>
                  p.regionalData.find((r) => r.region === region)
                    ?.sampleCount ?? 0
              )
            ),
            [`sentSampleCount-${region}`]: _.sum(
              prescriptionsByMatrix.map(
                (p) =>
                  p.regionalData.find((r) => r.region === region)
                    ?.sentSampleCount ?? 0
              )
            ),
            [`completionRate-${region}`]: matrixCompletionRate(
              prescriptionsByMatrix,
              region
            ),
          }),
          {}
        ),
      });
      workbook.commit();
    });
};

export default {
  writeToWorkbook,
};
