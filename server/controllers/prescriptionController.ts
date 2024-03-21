import { Request, Response } from 'express';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import prescriptionRepository from '../repositories/prescriptionRepository';
const findPrescriptions = async (request: Request, response: Response) => {
  const programmingPlanId = request.params.programmingPlanId;

  console.info('Find prescriptions by programming plan id', programmingPlanId);

  const prescriptions = await prescriptionRepository.findMany(
    programmingPlanId
  );

  response.status(constants.HTTP_STATUS_OK).send(prescriptions);
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
  createPrescriptions,
  updatePrescription,
  deletePrescriptions,
};
