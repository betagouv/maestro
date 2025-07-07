import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { isNil } from 'lodash-es';
import { HttpError } from 'maestro-shared/errors/httpError';
import NoRegionError from 'maestro-shared/errors/noRegionError';
import SampleMissingError from 'maestro-shared/errors/sampleMissingError';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import { PartialSampleToCreate } from 'maestro-shared/schema/Sample/Sample';
import { User, userRegions } from 'maestro-shared/schema/User/User';
import { departmentRepository } from '../../repositories/departmentRepository';
import { sampleRepository } from '../../repositories/sampleRepository';

export const sampleCheck =
  () => async (request: Request, _response: Response, next: NextFunction) => {
    const user = (request as AuthenticatedRequest).user;
    const sampleId = request.params.sampleId;
    request.sample = await getAndCheckSample(sampleId, user);

    next();
  };

export const getAndCheckSample = async (sampleId: string, user: User) => {
  const sample = await sampleRepository.findUnique(sampleId);

  if (!sample) {
    throw new SampleMissingError(sampleId);
  }

  if (!userRegions(user).includes(sample.region)) {
    throw new HttpError({
      status: constants.HTTP_STATUS_FORBIDDEN,
      name: 'BadRegionError',
      message: `Vous n'avez pas les droits sur cette région`
    });
  }

  return sample;
};

export const sampleLocalisationCheck =
  () => async (request: Request, _response: Response, next: NextFunction) => {
    const user = (request as AuthenticatedRequest).user;
    const sample = request.body as PartialSampleToCreate;

    request.body.department = await getAndCheckSampleDepartement(sample, user);

    next();
  };
export const getAndCheckSampleDepartement = async (
  sample: PartialSampleToCreate,
  user: User
) => {
  const department = await departmentRepository.getDepartment(
    sample.geolocation?.x,
    sample.geolocation?.y
  );
  if (department === null && !isNil(sample.geolocation)) {
    throw new HttpError({
      status: constants.HTTP_STATUS_BAD_REQUEST,
      name: 'BadCoordinatesError',
      message: `Coordonnées GPS incorrectes.`
    });
  }

  const regions = userRegions(user);
  if (regions.length === 0) {
    throw new NoRegionError();
  }

  const departments = regions.flatMap((r) => [
    ...Regions[r].departments,
    ...Regions[r].borderingDepartments
  ]);
  if (department !== null && !departments.includes(department)) {
    throw new HttpError({
      status: constants.HTTP_STATUS_FORBIDDEN,
      name: 'BadDepartmentError',
      message: `Vous n'avez pas les droits dans le département ${DepartmentLabels[department]}`
    });
  }

  return department;
};
