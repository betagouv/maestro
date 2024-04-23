import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import highland from 'highland';
import { constants } from 'http2';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import { genPrescriptionByMatrix } from '../../shared/schema/Prescription/PrescriptionsByMatrix';
import { Regions } from '../../shared/schema/Region';
import { userRegions } from '../../shared/schema/User/User';
import { isDefined } from '../../shared/utils/utils';
import prescriptionRepository from '../repositories/prescriptionRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import workbookUtils from '../utils/workbookUtils';
const findPrescriptions = async (request: Request, response: Response) => {
  const programmingPlanId = request.params.programmingPlanId;

  console.info('Find prescriptions by programming plan id', programmingPlanId);

  const prescriptions = await prescriptionRepository.findMany(
    programmingPlanId
  );

  response.status(constants.HTTP_STATUS_OK).send(prescriptions);
};

const exportPrescriptions = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlanId = request.params.programmingPlanId;

  console.info(
    'Export prescriptions by programming plan id',
    programmingPlanId
  );

  const programmingPlan = await programmingPlanRepository.findUnique(
    programmingPlanId
  );

  if (!programmingPlan) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  const prescriptions = await prescriptionRepository.findMany(
    programmingPlanId
  );

  const prescriptionByMatrix = genPrescriptionByMatrix(
    prescriptions,
    userRegions(user)
  );

  const fileName = `prescriptions-${programmingPlan.title
    .toLowerCase()
    .replaceAll(' ', '-')}.xlsx`;

  const workbook = workbookUtils.init(fileName, response);
  const worksheet = workbook.addWorksheet('Prescriptions');
  worksheet.columns = [
    { header: 'Matrice', key: 'sampleMatrix' },
    { header: 'Stade de prélèvement', key: 'sampleStage' },
    !user.region
      ? { header: 'Total national', key: 'sampleTotalCount' }
      : undefined,
    ...userRegions(user).map((region, index) => ({
      header: Regions[region].name,
      key: `sampleCount-${index}`,
    })),
  ].filter(isDefined);

  highland(prescriptionByMatrix)
    .each((prescription) => {
      worksheet
        .addRow({
          sampleMatrix: prescription.sampleMatrix,
          sampleStage: prescription.sampleStage,
          sampleTotalCount: _.sum(prescription.regionSampleCounts),
          ...prescription.regionSampleCounts.reduce(
            (acc, count, index) => ({
              ...acc,
              [`sampleCount-${index}`]: count,
            }),
            {}
          ),
        })
        .commit();
    })
    .done(() => {
      worksheet.addRow({
        sampleMatrix: 'Total',
        sampleTotalCount: _.sum(
          prescriptionByMatrix.flatMap((p) => p.regionSampleCounts)
        ),
        ...userRegions(user).reduce(
          (acc, _region, index) => ({
            ...acc,
            [`sampleCount-${index}`]: _.sum(
              prescriptionByMatrix.map((p) => p.regionSampleCounts[index])
            ),
          }),
          {}
        ),
      });
      workbook.commit();
    });
};

const createPrescriptions = async (request: Request, response: Response) => {
  const programmingPlanId = request.params.programmingPlanId;
  const prescriptionsToCreate = request.body as PrescriptionToCreate[];

  console.info(
    'Create prescriptions for programming plan with id',
    programmingPlanId,
    prescriptionsToCreate.length
  );

  const prescriptions = prescriptionsToCreate.map((prescription) => ({
    ...prescription,
    id: uuidv4(),
    programmingPlanId,
  }));

  await prescriptionRepository.insertMany(prescriptions);

  response.status(constants.HTTP_STATUS_CREATED).send(prescriptions);
};

const updatePrescription = async (request: Request, response: Response) => {
  const { programmingPlanId, prescriptionId } = request.params;
  const prescriptionUpdate = request.body as PrescriptionUpdate;

  console.info('Update prescription with id', prescriptionId);

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (
    prescription.programmingPlanId !== programmingPlanId ||
    prescription.id !== prescriptionId
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedPrescription = {
    ...prescription,
    sampleCount: prescriptionUpdate.sampleCount,
  };

  await prescriptionRepository.update(updatedPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedPrescription);
};

const deletePrescriptions = async (request: Request, response: Response) => {
  const programmingPlanId = request.params.programmingPlanId;
  const prescriptionIds = request.body as string[];

  console.info(
    'Delete prescriptions with ids',
    prescriptionIds,
    'for programming plan with id',
    programmingPlanId
  );

  const prescriptions = await prescriptionRepository.findMany(
    programmingPlanId
  );
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
