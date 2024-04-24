import _ from 'lodash';
import { z } from 'zod';
import { User, UserInfos } from './User';
import { UserRolePermissions } from './UserRole';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'readProgrammingPlans',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = [
  'createSample',
  'readSamples',
  'readProgrammingPlans',
  'updateSample',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
];

export const hasPermission = (
  user: User | UserInfos,
  ...permissions: UserPermission[]
) => {
  const userPermissions = user.roles
    .map((role) => UserRolePermissions[role])
    .flat();

  return _.intersection(permissions, userPermissions).length > 0;
};
