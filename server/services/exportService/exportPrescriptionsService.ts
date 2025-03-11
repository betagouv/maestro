import exceljs from 'exceljs';
import highland from 'highland';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';

import { sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { isDefined } from 'maestro-shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import workbookUtils from '../../utils/workbookUtils';
import WorkbookWriter = exceljs.stream.xlsx.WorkbookWriter;

interface PrescriptionWorkbookData {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: RegionalPrescription[];
  exportedRegion: Region | undefined;
}

const writeToWorkbook = async (
  {
    programmingPlan,
    prescriptions,
    regionalPrescriptions,
    exportedRegion
  }: PrescriptionWorkbookData,
  workbook: WorkbookWriter
) => {
  const exportedRegions = exportedRegion ? [exportedRegion] : RegionList;

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
          width: 15
        }
      : undefined,
    !exportedRegion &&
    programmingPlan.regionalStatus.some((_) => _.status === 'Validated')
      ? {
          header: 'Total national\nRéalisés',
          key: 'sentSampleTotalCount',
          width: 15
        }
      : undefined,
    !exportedRegion &&
    programmingPlan.regionalStatus.some((_) => _.status === 'Validated')
      ? {
          header: 'Total national\nTaux de réalisation',
          key: 'completionRate',
          width: 15
        }
      : undefined,
    ...exportedRegions.map((region) => [
      {
        header: `${Regions[region].shortName}\nProgrammés`,
        key: `sampleCount-${region}`,
        width: 10
      },
      programmingPlan.regionalStatus.some((_) => _.status === 'Validated')
        ? {
            header: `${Regions[region].shortName}\nRéalisés`,
            key: `realizedSampleCount-${region}`,
            width: 10
          }
        : undefined,
      programmingPlan.regionalStatus.some((_) => _.status === 'Validated')
        ? {
            header: `${Regions[region].shortName}\nTaux de réalisation`,
            key: `completionRate-${region}`,
            width: 10
          }
        : undefined
    ]),
    exportedRegion
      ? {
          header: 'Laboratoire',
          key: 'laboratory',
          width: 20
        }
      : undefined
  ]
    .flat()
    .filter(isDefined);

  highland(prescriptions.sort(PrescriptionSort))
    .map((prescription) => ({
      prescription,
      filteredRegionalPrescriptions: [
        ...regionalPrescriptions.filter(
          (r) => r.prescriptionId === prescription.id
        )
      ]
    }))
    .each(({ prescription, filteredRegionalPrescriptions }) => {
      workbookUtils
        .addRowToWorksheet(worksheet, {
          matrix: MatrixKindLabels[prescription.matrixKind],
          stages: prescription.stages
            .map((stage) => StageLabels[stage])
            .join('\n'),
          sampleTotalCount: sumBy(filteredRegionalPrescriptions, 'sampleCount'),
          sentSampleTotalCount: sumBy(
            filteredRegionalPrescriptions,
            'realizedSampleCount'
          ),
          completionRate: getCompletionRate(filteredRegionalPrescriptions),
          ...filteredRegionalPrescriptions.reduce(
            (acc, { sampleCount, realizedSampleCount, region }) => ({
              ...acc,
              [`sampleCount-${region}`]: sampleCount,
              [`realizedSampleCount-${region}`]: realizedSampleCount,
              [`completionRate-${region}`]: getCompletionRate(
                filteredRegionalPrescriptions,
                region
              )
            }),
            {}
          ),
          laboratory: laboratories.find(
            (laboratory) =>
              laboratory.id === filteredRegionalPrescriptions[0]?.laboratoryId
          )?.name
        })
        .commit();
    })
    .done(() => {
      workbookUtils.addRowToWorksheet(worksheet, {
        matrix: 'Total',
        sampleTotalCount: sumBy(regionalPrescriptions, 'sampleCount'),
        sentSampleTotalCount: sumBy(
          regionalPrescriptions,
          'realizedSampleCount'
        ),
        completionRate: getCompletionRate(regionalPrescriptions),
        ...exportedRegions.reduce(
          (acc, region) => ({
            ...acc,
            [`sampleCount-${region}`]: sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'sampleCount'
            ),
            [`realizedSampleCount-${region}`]: sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'realizedSampleCount'
            ),
            [`completionRate-${region}`]: getCompletionRate(
              regionalPrescriptions.filter((r) => r.region === region),
              region
            )
          }),
          {}
        )
      });
      workbook.commit();
    });
};

export default {
  writeToWorkbook
};
