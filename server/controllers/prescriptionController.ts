import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import PrescriptionMissingError from '../../shared/errors/prescriptionPlanMissingError';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionsToCreate,
  PrescriptionsToDelete,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import {
  PrescriptionComment,
  PrescriptionCommentToCreate,
} from '../../shared/schema/Prescription/PrescriptionComment';
import { ContextLabels } from '../../shared/schema/ProgrammingPlan/Context';
import { hasPermission, userRegions } from '../../shared/schema/User/User';
import prescriptionCommentRepository from '../repositories/prescriptionCommentRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import exportPrescriptionsService from '../services/exportService/exportPrescriptionsService';
import workbookUtils from '../utils/workbookUtils';
const findPrescriptions = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const queryFindOptions = request.query as FindPrescriptionOptions;

  const findOptions = {
    ...queryFindOptions,
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
    region: exportedRegion,
  };

  console.info('Export prescriptions', user.id, findOptions);

  const prescriptions = await prescriptionRepository.findMany(findOptions);

  const fileName = `prescriptions-${
    findOptions.context &&
    ContextLabels[findOptions.context].toLowerCase().replaceAll(' ', '-')
  }.xlsx`;

  const workbook = workbookUtils.init(fileName, response);

  await exportPrescriptionsService.writeToWorkbook(
    {
      prescriptions,
      programmingPlan,
      context: findOptions.context,
      exportedRegion,
    },
    workbook
  );
};

const createPrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const prescriptionsToCreate = request.body as PrescriptionsToCreate;

  console.info(
    'Create prescriptions for programming plan with id',
    programmingPlan.id,
    prescriptionsToCreate.prescriptions.length
  );

  const prescriptions = prescriptionsToCreate.prescriptions.map(
    (prescription) => ({
      ...prescription,
      id: uuidv4(),
      programmingPlanId: programmingPlan.id,
      context: prescriptionsToCreate.context,
    })
  );

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
    throw new PrescriptionMissingError(prescriptionId);
  }

  if (
    prescription.programmingPlanId !== programmingPlan.id ||
    prescription.context !== prescriptionUpdate.context
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedPrescription = {
    ...prescription,
    sampleCount:
      hasPermission(user, 'updatePrescription') &&
      prescriptionUpdate.sampleCount
        ? prescriptionUpdate.sampleCount
        : prescription.sampleCount,
    stages:
      hasPermission(user, 'updatePrescription') && prescriptionUpdate.stages
        ? prescriptionUpdate.stages
        : prescription.stages,
    laboratoryId: hasPermission(user, 'updatePrescriptionLaboratory')
      ? prescriptionUpdate.laboratoryId
      : prescription.laboratoryId,
  };

  await prescriptionRepository.update(updatedPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedPrescription);
};

const deletePrescriptions = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const prescriptionsDelete = request.body as PrescriptionsToDelete;

  console.info(
    'Delete prescriptions with ids',
    prescriptionsDelete.prescriptionIds,
    'for programming plan with id',
    programmingPlan.id
  );

  const prescriptions = await prescriptionRepository.findMany({
    programmingPlanId: programmingPlan.id,
    context: prescriptionsDelete.context,
  });
  const existingPrescriptionIds = prescriptions.map((p) => p.id);

  await prescriptionRepository.deleteMany(
    prescriptionsDelete.prescriptionIds.filter((id) =>
      existingPrescriptionIds.includes(id)
    )
  );

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

const commentPrescription = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const draftPrescriptionComment = request.body as PrescriptionCommentToCreate;
  const prescriptionId = request.params.prescriptionId;

  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    throw new PrescriptionMissingError(prescriptionId);
  }
  console.info(
    'Comment prescription with id',
    userRegions(user),
    prescription.region
  );

  if (!userRegions(user).includes(prescription.region)) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const prescriptionComment: PrescriptionComment = {
    id: uuidv4(),
    prescriptionId,
    comment: draftPrescriptionComment.comment,
    createdAt: new Date(),
    createdBy: user.id,
  };

  await prescriptionCommentRepository.insert(prescriptionComment);

  response.status(constants.HTTP_STATUS_CREATED).send(prescriptionComment);
};

export default {
  findPrescriptions,
  exportPrescriptions,
  createPrescriptions,
  updatePrescription,
  deletePrescriptions,
  commentPrescription,
};
