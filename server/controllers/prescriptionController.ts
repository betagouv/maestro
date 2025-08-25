import { Request, Response } from 'express';
import {
  AuthenticatedRequest,
  PrescriptionRequest,
  ProgrammingPlanRequest
} from 'express-jwt';
import { constants } from 'http2';
import { RegionList } from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  hasPrescriptionPermission,
  PrescriptionToCreate,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindRegionalPrescriptionOptions } from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { hasNationalRole } from 'maestro-shared/schema/User/User';
import { v4 as uuidv4 } from 'uuid';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
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
  const exportedRegion =
    (hasNationalRole(user) ? queryFindOptions.region : user.region) ??
    undefined;

  const findOptions = {
    ...queryFindOptions,
    region: exportedRegion
  };

  console.info('Export prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(queryFindOptions);
  const regionalPrescriptions = await regionalPrescriptionRepository.findMany({
    ...findOptions,
    includes: ['comments', 'sampleCounts']
  });

  const fileName = `prescriptions-${findOptions.contexts?.map((context) =>
    ContextLabels[context].toLowerCase().replaceAll(' ', '-')
  )}.xlsx`;

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
  const { prescription, programmingPlan } = request as PrescriptionRequest;
  const prescriptionUpdate = request.body as PrescriptionUpdate;

  if (!hasPrescriptionPermission(user, programmingPlan).update) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  console.info('Update prescription with id', prescription.id);

  const updatedPrescription = {
    ...prescription,
    stages: prescriptionUpdate.stages ?? prescription.stages,
    notes: prescriptionUpdate.notes ?? prescription.notes
  };

  await prescriptionRepository.update(updatedPrescription);

  if (prescriptionUpdate.substances) {
    const substances = prescriptionUpdate.substances.map((substance) => ({
      prescriptionId: prescription.id,
      ...substance
    }));

    await prescriptionSubstanceRepository.deleteMany(prescription.id);
    await prescriptionSubstanceRepository.insertMany(substances);
  }

  response.status(constants.HTTP_STATUS_OK).send(updatedPrescription);
};

const deletePrescription = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const { prescription, programmingPlan } = request as PrescriptionRequest;

  console.info('Delete prescription with id', prescription.id);

  if (!hasPrescriptionPermission(user, programmingPlan).delete) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await prescriptionRepository.deleteOne(prescription.id);

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

const getPrescriptionSubstances = async (
  request: Request,
  response: Response
) => {
  const { prescription } = request as PrescriptionRequest;

  console.info('Get prescription substances', prescription.id);

  const substances = await prescriptionSubstanceRepository.findMany(
    prescription.id
  );

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
