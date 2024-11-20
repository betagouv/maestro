import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import PrescriptionMissingError from '../../shared/errors/prescriptionPlanMissingError';
import ProgrammingPlanMissingError from '../../shared/errors/programmingPlanMissingError';
import { RegionList } from '../../shared/referential/Region';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import { ContextLabels } from '../../shared/schema/ProgrammingPlan/Context';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import prescriptionRepository from '../repositories/prescriptionRepository';
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
  const queryFindOptions = request.query as FindRegionalPrescriptionOptions;
  const exportedRegion = user.region ?? queryFindOptions.region ?? undefined;

  const findOptions = {
    ...queryFindOptions,
    region: exportedRegion,
  };

  console.info('Export prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(queryFindOptions);
  const regionalPrescriptions = await regionalPrescriptionRepository.findMany({
    ...findOptions,
    includes: ['comments', 'realizedSampleCount'],
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
      regionalPrescriptions,
    },
    workbook
  );
};

const createPrescription = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const prescriptionToCreate = request.body as PrescriptionToCreate;

  console.info(
    'Create prescriptions for programming plan with id',
    programmingPlan.id
  );

  const createdPrescription = {
    ...prescriptionToCreate,
    id: uuidv4(),
    programmingPlanId: programmingPlan.id,
  };

  await prescriptionRepository.insert(createdPrescription);

  await regionalPrescriptionRepository.insertMany(
    RegionList.map((region) => ({
      id: uuidv4(),
      prescriptionId: createdPrescription.id,
      region,
      sampleCount: 0,
    }))
  );

  response.status(constants.HTTP_STATUS_CREATED).send(createdPrescription);
};

const updatePrescription = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const { prescriptionId } = request.params;
  const prescriptionUpdate = request.body as PrescriptionUpdate;

  console.info('Update prescription with id', prescriptionId);

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    throw new PrescriptionMissingError(prescriptionId);
  }

  if (prescription.programmingPlanId !== programmingPlan.id) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedPrescription = {
    ...prescription,
    stages: prescriptionUpdate.stages,
  };

  await prescriptionRepository.update(updatedPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedPrescription);
};

const updateRegionalPrescription = async (
  request: Request,
  response: Response
) => {
  // const user = (request as AuthenticatedRequest).user;
  // const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  // const { regionalPrescriptionId } = request.params;
  // const regionalPrescriptionUpdate = request.body as RegionalPrescriptionUpdate;
  //
  // console.info(
  //   'Update regional prescription with id',
  //   regionalPrescriptionUpdate
  // );
  //
  // const prescription = await prescriptionRepository.findUnique(prescriptionId);
  //
  // if (!prescription) {
  //   throw new PrescriptionMissingError(prescriptionId);
  // }
  //
  // if (
  //   prescription.programmingPlanId !== programmingPlan.id ||
  //   prescription.context !== prescriptionUpdate.context
  // ) {
  //   return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  // }
  //
  // const updatedPrescription = {
  //   ...prescription,
  //   sampleCount:
  //     hasPermission(user, 'updatePrescription') &&
  //     prescriptionUpdate.sampleCount
  //       ? prescriptionUpdate.sampleCount
  //       : prescription.sampleCount,
  //   stages:
  //     hasPermission(user, 'updatePrescription') && prescriptionUpdate.stages
  //       ? prescriptionUpdate.stages
  //       : prescription.stages,
  //   laboratoryId: hasPermission(user, 'updatePrescriptionLaboratory')
  //     ? prescriptionUpdate.laboratoryId
  //     : prescription.laboratoryId,
  // };
  //
  // await prescriptionRepository.update(updatedPrescription);

  response.status(constants.HTTP_STATUS_OK); //.send(updatedPrescription);
};

const deletePrescription = async (request: Request, response: Response) => {
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

  if (!['InProgress', 'Submitted'].includes(programmingPlan.status)) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await prescriptionRepository.deleteOne(prescriptionId);

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

const commentPrescription = async (request: Request, response: Response) => {
  // const { user } = request as AuthenticatedRequest;
  // const draftPrescriptionComment = request.body as PrescriptionCommentToCreate;
  // const prescriptionId = request.params.prescriptionId;
  //
  // const prescription = await prescriptionRepository.findUnique(prescriptionId);
  //
  // if (!prescription) {
  //   throw new PrescriptionMissingError(prescriptionId);
  // }
  // console.info(
  //   'Comment prescription with id',
  //   userRegions(user),
  //   prescription.region
  // );
  //
  // if (!userRegions(user).includes(prescription.region)) {
  //   return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  // }
  //
  // const prescriptionComment: PrescriptionComment = {
  //   id: uuidv4(),
  //   prescriptionId,
  //   comment: draftPrescriptionComment.comment,
  //   createdAt: new Date(),
  //   createdBy: user.id,
  // };
  //
  // await prescriptionCommentRepository.insert(prescriptionComment);

  response.status(constants.HTTP_STATUS_CREATED); //.send(prescriptionComment);
};

export default {
  findPrescriptions,
  exportPrescriptions,
  createPrescription,
  updatePrescription,
  updateRegionalPrescription,
  deletePrescription,
  commentPrescription,
};
