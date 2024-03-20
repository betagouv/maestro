import { Request, Response } from 'express';
import { constants } from 'http2';
import { PrescriptionUpdate } from '../../shared/schema/Prescription/Prescription';
import prescriptionRepository from '../repositories/prescriptionRepository';

const findPrescriptions = async (request: Request, response: Response) => {
  const programmingPlanId = request.params.programmingPlanId;

  console.info('Find prescriptions by programming plan id', programmingPlanId);

  const prescriptions = await prescriptionRepository.findMany(
    programmingPlanId
  );

  response.status(constants.HTTP_STATUS_OK).send(prescriptions);
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

export default {
  findPrescriptions,
  updatePrescription,
};
