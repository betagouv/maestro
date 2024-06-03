import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import highland from 'highland';
import { constants } from 'http2';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { MatrixLabels } from '../../shared/referential/Matrix/MatrixLabels';
import { RegionList, Regions } from '../../shared/referential/Region';
import { StageLabels } from '../../shared/referential/Stage';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import {
  genPrescriptionByMatrix,
  matrixCompletionRate,
} from '../../shared/schema/Prescription/PrescriptionsByMatrix';
import { hasPermission } from '../../shared/schema/User/User';
import { isDefined } from '../../shared/utils/utils';
import laboratoryRepository from '../repositories/laboratoryRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import sampleRepository from '../repositories/sampleRepository';
import workbookUtils from '../utils/workbookUtils';
const findPrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const user = (request as AuthenticatedRequest).user;
  const queryFindOptions = request.query as FindPrescriptionOptions;

  const findOptions = {
    ...queryFindOptions,
    programmingPlanId: programmingPlan.id,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Find prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(prescriptions);
};

const exportPrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const user = (request as AuthenticatedRequest).user;
  const queryFindOptions = request.query as FindPrescriptionOptions;

  const uniqueExportedRegion = user.region ?? queryFindOptions.region;
  const exportedRegions = uniqueExportedRegion
    ? [uniqueExportedRegion]
    : RegionList;

  const findOptions = {
    ...queryFindOptions,
    programmingPlanId: programmingPlan.id,
    region: uniqueExportedRegion,
  };

  console.info('Export prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(findOptions);

  const samples = await sampleRepository.findMany({
    programmingPlanId: programmingPlan.id,
    status: 'Sent',
  });

  const laboratories = uniqueExportedRegion
    ? await laboratoryRepository.findMany()
    : [];

  const prescriptionByMatrix = genPrescriptionByMatrix(
    prescriptions,
    samples,
    exportedRegions
  );

  const fileName = `prescriptions-${programmingPlan.title
    .toLowerCase()
    .replaceAll(' ', '-')}.xlsx`;

  const workbook = workbookUtils.init(fileName, response);
  const worksheet = workbook.addWorksheet('Prescriptions');
  worksheet.columns = [
    { header: 'Matrice', key: 'matrix', width: 30 },
    { header: 'Stade(s) de prélèvement', key: 'stages', width: 20 },
    !uniqueExportedRegion
      ? {
          header: 'Total national\nProgrammés',
          key: 'sampleTotalCount',
          width: 15,
        }
      : undefined,
    !uniqueExportedRegion && programmingPlan.status === 'Validated'
      ? {
          header: 'Total national\nRéalisés',
          key: 'sentSampleTotalCount',
          width: 15,
        }
      : undefined,
    !uniqueExportedRegion && programmingPlan.status === 'Validated'
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
    uniqueExportedRegion
      ? {
          header: 'Laboratoire',
          key: 'laboratory',
          width: 20,
        }
      : undefined,
  ]
    .flat()
    .filter(isDefined);

  highland(prescriptionByMatrix)
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
          prescriptionByMatrix
            .flatMap((p) => p.regionalData)
            .map((p) => p.sampleCount)
        ),
        sentSampleTotalCount: _.sum(
          prescriptionByMatrix
            .flatMap((p) => p.regionalData)
            .map((p) => p.sentSampleCount)
        ),
        completionRate: matrixCompletionRate(prescriptionByMatrix),
        ...exportedRegions.reduce(
          (acc, region) => ({
            ...acc,
            [`sampleCount-${region}`]: _.sum(
              prescriptionByMatrix.map(
                (p) =>
                  p.regionalData.find((r) => r.region === region)
                    ?.sampleCount ?? 0
              )
            ),
            [`sentSampleCount-${region}`]: _.sum(
              prescriptionByMatrix.map(
                (p) =>
                  p.regionalData.find((r) => r.region === region)
                    ?.sentSampleCount ?? 0
              )
            ),
            [`completionRate-${region}`]: matrixCompletionRate(
              prescriptionByMatrix,
              region
            ),
          }),
          {}
        ),
      });
      workbook.commit();
    });
};

const createPrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const prescriptionsToCreate = request.body as PrescriptionToCreate[];

  console.info(
    'Create prescriptions for programming plan with id',
    programmingPlan.id,
    prescriptionsToCreate.length
  );

  const prescriptions = prescriptionsToCreate.map((prescription) => ({
    ...prescription,
    id: uuidv4(),
    programmingPlanId: programmingPlan.id,
  }));

  await prescriptionRepository.insertMany(prescriptions);

  response.status(constants.HTTP_STATUS_CREATED).send(prescriptions);
};

const updatePrescription = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const { prescriptionId } = request.params;
  const prescriptionUpdate = request.body as PrescriptionUpdate;

  console.info('Update prescription with id', prescriptionId);

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (
    prescription.programmingPlanId !== programmingPlan.id ||
    prescription.id !== prescriptionId
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedPrescription = {
    ...prescription,
    sampleCount:
      hasPermission(user, 'updatePrescriptionSampleCount') &&
      prescriptionUpdate.sampleCount
        ? prescriptionUpdate.sampleCount
        : prescription.sampleCount,
    laboratoryId: hasPermission(user, 'updatePrescriptionLaboratory')
      ? prescriptionUpdate.laboratoryId
      : prescription.laboratoryId,
  };

  await prescriptionRepository.update(updatedPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedPrescription);
};

const deletePrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const prescriptionIds = request.body as string[];

  console.info(
    'Delete prescriptions with ids',
    prescriptionIds,
    'for programming plan with id',
    programmingPlan.id
  );

  const prescriptions = await prescriptionRepository.findMany({
    programmingPlanId: programmingPlan.id,
  });
  const existingPrescriptionIds = prescriptions.map((p) => p.id);

  await prescriptionRepository.deleteMany(
    prescriptionIds.filter((id) => existingPrescriptionIds.includes(id))
  );

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

export default {
  findPrescriptions,
  exportPrescriptions,
  createPrescriptions,
  updatePrescription,
  deletePrescriptions,
};
