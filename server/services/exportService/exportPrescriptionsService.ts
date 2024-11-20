import exceljs from 'exceljs';
import highland from 'highland';
import {
  Region,
  RegionList,
  Regions,
} from '../../../shared/referential/Region';
import {
  Prescription,
  PrescriptionSort,
} from '../../../shared/schema/Prescription/Prescription';

import _ from 'lodash';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { StageLabels } from '../../../shared/referential/Stage';
import { ProgrammingPlan } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription,
} from '../../../shared/schema/RegionalPrescription/RegionalPrescription';
import { isDefined } from '../../../shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
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
    exportedRegion,
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
            key: `realizedSampleCount-${region}`,
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

  highland(prescriptions.sort(PrescriptionSort))
    .map((prescription) => ({
      prescription,
      filteredRegionalPrescriptions: [
        ...regionalPrescriptions.filter(
          (r) => r.prescriptionId === prescription.id
        ),
      ],
    }))
    .each(({ prescription, filteredRegionalPrescriptions }) => {
      worksheet
        .addRow({
          matrix: MatrixLabels[prescription.matrix],
          stages: prescription.stages
            .map((stage) => StageLabels[stage])
            .join('\n'),
          sampleTotalCount: _.sumBy(
            filteredRegionalPrescriptions,
            'sampleCount'
          ),
          sentSampleTotalCount: _.sumBy(
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
              ),
            }),
            {}
          ),
          laboratory: laboratories.find(
            (laboratory) =>
              laboratory.id === filteredRegionalPrescriptions[0]?.laboratoryId
          )?.name,
        })
        .commit();
    })
    .done(() => {
      worksheet.addRow({
        matrix: 'Total',
        sampleTotalCount: _.sumBy(regionalPrescriptions, 'sampleCount'),
        sentSampleTotalCount: _.sumBy(
          regionalPrescriptions,
          'realizedSampleCount'
        ),
        completionRate: getCompletionRate(regionalPrescriptions),
        ...exportedRegions.reduce(
          (acc, region) => ({
            ...acc,
            [`sampleCount-${region}`]: _.sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'sampleCount'
            ),
            [`realizedSampleCount-${region}`]: _.sumBy(
              regionalPrescriptions.filter((r) => r.region === region),
              'realizedSampleCount'
            ),
            [`completionRate-${region}`]: getCompletionRate(
              regionalPrescriptions.filter((r) => r.region === region),
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
