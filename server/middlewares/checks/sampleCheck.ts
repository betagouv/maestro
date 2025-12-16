import { constants } from 'http2';
import { isNil } from 'lodash-es';
import { HttpError } from 'maestro-shared/errors/httpError';
import NoRegionError from 'maestro-shared/errors/noRegionError';
import SampleMissingError from 'maestro-shared/errors/sampleMissingError';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { UserBase, userRegionsForRole } from 'maestro-shared/schema/User/User';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { departmentRepository } from '../../repositories/departmentRepository';
import { sampleRepository } from '../../repositories/sampleRepository';

export const getAndCheckSample = async (
  sampleId: string,
  user: UserBase,
  userRole: UserRole
): Promise<PartialSample> => {
  const sample = await sampleRepository.findUnique(sampleId);

  if (!sample) {
    throw new SampleMissingError(sampleId);
  }

  if (!userRegionsForRole(user, userRole).includes(sample.region)) {
    throw new HttpError({
      status: constants.HTTP_STATUS_FORBIDDEN,
      name: 'BadRegionError',
      message: `Vous n'avez pas les droits sur cette région`
    });
  }

  return sample;
};

export const getAndCheckSampleDepartement = async (
  sample: PartialSampleToCreate,
  user: UserBase,
  userRole: UserRole
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

  const regions = userRegionsForRole(user, userRole);
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
