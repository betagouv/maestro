import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import { hasPermission } from '../../shared/schema/User/User';
import prescriptionRepository from '../repositories/prescriptionRepository';
import exportPrescriptionsService from '../services/exportService/exportPrescriptionsService';
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

  const exportedRegion = user.region ?? queryFindOptions.region ?? undefined;

  const findOptions = {
    ...queryFindOptions,
    programmingPlanId: programmingPlan.id,
    region: exportedRegion,
  };

  console.info('Export prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(findOptions);

  const fileName = `prescriptions-${programmingPlan.title
    .toLowerCase()
    .replaceAll(' ', '-')}.xlsx`;

  const workbook = workbookUtils.init(fileName, response);

  await exportPrescriptionsService.writeToWorkbook(
    {
      prescriptions,
      programmingPlan,
      exportedRegion,
    },
    workbook
  );
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
