import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { isNil } from 'lodash-es';
import SampleMissingError from 'maestro-shared/errors/sampleMissingError';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import { PartialSampleToCreate } from 'maestro-shared/schema/Sample/Sample';
import { userRegions } from 'maestro-shared/schema/User/User';
import { departmentRepository } from '../../repositories/departmentRepository';
import { sampleRepository } from '../../repositories/sampleRepository';

export const sampleCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const user = (request as AuthenticatedRequest).user;
    const sampleId = request.params.sampleId;

    const sample = await sampleRepository.findUnique(sampleId);

    if (!sample) {
      throw new SampleMissingError(sampleId);
    }

    if (!userRegions(user).includes(sample.region)) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.sample = sample;

    next();
  };

export const sampleLocalisationCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const user = (request as AuthenticatedRequest).user;
    const sample = request.body as PartialSampleToCreate;
    const department = await departmentRepository.getDepartment(
      sample.geolocation?.x,
      sample.geolocation?.y
    );
    if (department === null && !isNil(sample.geolocation)) {
      return response
        .status(constants.HTTP_STATUS_BAD_REQUEST)
        .send('Coordonnées GPS incorrectes.');
    }

    const regions = userRegions(user);
    if (regions.length === 0) {
      return response
        .status(constants.HTTP_STATUS_FORBIDDEN)
        .send(`Vous n'êtes associé à aucune région.`);
    }

    const departments = regions.flatMap((r) => [
      ...Regions[r].departments,
      ...Regions[r].borderingDepartments
    ]);
    if (department !== null && !departments.includes(department)) {
      return response
        .status(constants.HTTP_STATUS_FORBIDDEN)
        .send(
          `Vous n'avez pas les droits dans le département ${DepartmentLabels[department]}`
        );
    }

    request.body.department = department;

    next();
  };
