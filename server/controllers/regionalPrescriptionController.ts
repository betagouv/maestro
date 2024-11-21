import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import PrescriptionMissingError from '../../shared/errors/prescriptionPlanMissingError';
import RegionalPrescriptionMissingError from '../../shared/errors/regionalPrescriptionPlanMissingError';
import { Region } from '../../shared/referential/Region';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescriptionUpdate } from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import { hasPermission, userRegions } from '../../shared/schema/User/User';
import laboratoryRepository from '../repositories/laboratoryRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
const findRegionalPrescriptions = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const queryFindOptions = request.query as FindRegionalPrescriptionOptions;

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Find regional prescriptions', user.id, findOptions);

  const regionalPrescriptions = await regionalPrescriptionRepository.findMany(
    findOptions
  );

  response.status(constants.HTTP_STATUS_OK).send(regionalPrescriptions);
};

const updateRegionalPrescription = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const { regionalPrescriptionId } = request.params;
  const regionalPrescriptionUpdate = request.body as RegionalPrescriptionUpdate;

  console.info('Update regional prescription with id', regionalPrescriptionId);

  const regionalPrescription =
    await regionalPrescriptionRepository.findUniqueDeprecated(
      //TODO
      regionalPrescriptionId
    );

  if (!regionalPrescription) {
    throw new PrescriptionMissingError(regionalPrescriptionId); //TODO regional
  }

  const prescription = await prescriptionRepository.findUnique(
    regionalPrescription.prescriptionId
  );

  if (!prescription) {
    throw new PrescriptionMissingError(regionalPrescription.prescriptionId);
  }

  if (prescription.programmingPlanId !== programmingPlan.id) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedRegionalPrescription = {
    ...regionalPrescription,
    sampleCount:
      hasPermission(user, 'updatePrescription') &&
      regionalPrescriptionUpdate.sampleCount !== undefined
        ? regionalPrescriptionUpdate.sampleCount
        : regionalPrescription.sampleCount,
    laboratoryId: hasPermission(user, 'updatePrescriptionLaboratory')
      ? regionalPrescriptionUpdate.laboratoryId
      : regionalPrescription.laboratoryId,
  };

  await regionalPrescriptionRepository.update(updatedRegionalPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedRegionalPrescription);
};

const commentRegionalPrescription = async (
  request: Request,
  response: Response
) => {
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

const getRegionalPrescriptionLaboratory = async (
  request: Request,
  response: Response
) => {
  const { user } = request as AuthenticatedRequest;
  const { region, prescriptionId } = request.params as {
    region: Region;
    prescriptionId: string;
  };

  if (!userRegions(user).includes(region)) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const regionalPrescription = await regionalPrescriptionRepository.findUnique(
    prescriptionId,
    region
  );

  if (!regionalPrescription) {
    throw new RegionalPrescriptionMissingError(prescriptionId, region);
  }

  console.info(
    'Get laboratory for regional prescription',
    prescriptionId,
    region
  );

  const laboratory = regionalPrescription.laboratoryId
    ? await laboratoryRepository.findUnique(regionalPrescription.laboratoryId)
    : undefined;

  response.status(constants.HTTP_STATUS_OK).send(laboratory);
};

export default {
  findRegionalPrescriptions,
  updateRegionalPrescription,
  commentRegionalPrescription,
  getRegionalPrescriptionLaboratory,
};
