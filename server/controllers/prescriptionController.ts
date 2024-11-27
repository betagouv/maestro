import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import PrescriptionMissingError from '../../shared/errors/prescriptionPlanMissingError';
import ProgrammingPlanMissingError from '../../shared/errors/programmingPlanMissingError';
import { RegionList } from '../../shared/referential/Region';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  hasPrescriptionPermission,
  PrescriptionToCreate,
  PrescriptionUpdate
} from '../../shared/schema/Prescription/Prescription';
import { ContextLabels } from '../../shared/schema/ProgrammingPlan/Context';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import exportPrescriptionsService from '../services/exportService/exportPrescriptionsService';
import workbookUtils from '../utils/workbookUtils';
const findPrescriptions = async (request: Request, response: Response) => {
  const findOptions = request.query as FindPrescriptionOptions;

  console.info('Find prescriptions', findOptions);

  const prescriptions = await prescriptionRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(prescriptions);
};

const exportPrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const user = (request as AuthenticatedRequest).user;
  const queryFindOptions = request.query as Omit<
    FindRegionalPrescriptionOptions,
    'includes'
  >;
  const exportedRegion = user.region ?? queryFindOptions.region ?? undefined;

  const findOptions = {
    ...queryFindOptions,
    region: exportedRegion
  };

  console.info('Export prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(queryFindOptions);
  const regionalPrescriptions = await regionalPrescriptionRepository.findMany({
    ...findOptions,
    includes: ['comments', 'realizedSampleCount']
  });

  const fileName = `prescriptions-${
    findOptions.context &&
    ContextLabels[findOptions.context].toLowerCase().replaceAll(' ', '-')
  }.xlsx`;

  const workbook = workbookUtils.init(fileName, response);

  await exportPrescriptionsService.writeToWorkbook(
    {
      prescriptions,
      programmingPlan,
      exportedRegion,
      regionalPrescriptions
    },
    workbook
  );
};

const createPrescription = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const prescriptionToCreate = request.body as PrescriptionToCreate;

  if (!hasPrescriptionPermission(user, programmingPlan).create) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  console.info(
    'Create prescriptions for programming plan with id',
    programmingPlan.id
  );

  const createdPrescription = {
    ...prescriptionToCreate,
    id: uuidv4(),
    programmingPlanId: programmingPlan.id
  };

  await prescriptionRepository.insert(createdPrescription);

  await regionalPrescriptionRepository.insertMany(
    RegionList.map((region) => ({
      prescriptionId: createdPrescription.id,
      region,
      sampleCount: 0
    }))
  );

  response.status(constants.HTTP_STATUS_CREATED).send(createdPrescription);
};

const updatePrescription = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const { prescriptionId } = request.params;
  const prescriptionUpdate = request.body as PrescriptionUpdate;

  if (!hasPrescriptionPermission(user, programmingPlan).update) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  console.info('Update prescription with id', prescriptionId);

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    throw new PrescriptionMissingError(prescriptionId);
  }

  if (prescription.programmingPlanId !== programmingPlan.id) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (programmingPlan.status === 'Validated') {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedPrescription = {
    ...prescription,
    stages: prescriptionUpdate.stages ?? prescription.stages
  };

  await prescriptionRepository.update(updatedPrescription);

  if (prescriptionUpdate.substances) {
    const substances = prescriptionUpdate.substances.map((substance) => ({
      prescriptionId,
      ...substance
    }));

    await prescriptionSubstanceRepository.deleteMany(prescriptionId);
    await prescriptionSubstanceRepository.insertMany(substances);
  }

  response.status(constants.HTTP_STATUS_OK).send(updatedPrescription);
};

const deletePrescription = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const prescriptionId = request.params.prescriptionId;

  console.info('Delete prescription with id', prescriptionId);

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    throw new PrescriptionMissingError(prescriptionId);
  }

  const programmingPlan = await programmingPlanRepository.findUnique(
    prescription.programmingPlanId
  );

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(prescription.programmingPlanId);
  }

  if (!hasPrescriptionPermission(user, programmingPlan).delete) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await prescriptionRepository.deleteOne(prescriptionId);

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

const getPrescriptionSubstances = async (
  request: Request,
  response: Response
) => {
  const { prescriptionId } = request.params;

  console.info('Get prescription substances', prescriptionId);

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    throw new PrescriptionMissingError(prescriptionId);
  }

  const substances =
    await prescriptionSubstanceRepository.findMany(prescriptionId);

  response.status(constants.HTTP_STATUS_OK).send(substances);
};

export default {
  findPrescriptions,
  exportPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionSubstances
};
