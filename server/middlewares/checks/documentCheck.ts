import { constants } from 'node:http2';
import { intersection } from 'lodash-es';
import DocumentMissingError from 'maestro-shared/errors/documentMissingError';
import { HttpError } from 'maestro-shared/errors/httpError';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { ResourceDocumentKindList } from 'maestro-shared/schema/Document/DocumentKind';
import { buildFindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import type { UserBase } from 'maestro-shared/schema/User/User';
import type { UserRole } from 'maestro-shared/schema/User/UserRole';
import { documentRepository } from '../../repositories/documentRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { getAndCheckSample } from './sampleCheck';

const denyAccess = (
  user: UserBase,
  userRole: UserRole,
  document: DocumentChecked,
  reason: string
): never => {
  console.warn('Resource document access denied', {
    who: user.id,
    role: userRole,
    documentId: document.id,
    kind: document.kind,
    result: 'forbidden',
    reason
  });
  throw new HttpError({
    status: constants.HTTP_STATUS_FORBIDDEN,
    name: 'DocumentOutOfScopeError',
    message: `Vous n'avez pas les droits sur ce document`
  });
};

export const getAndCheckResourceDocument = async (
  documentId: string,
  user: UserBase,
  userRole: UserRole
): Promise<DocumentChecked> => {
  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    throw new DocumentMissingError(documentId);
  }

  if (!ResourceDocumentKindList.includes(document.kind)) {
    return denyAccess(user, userRole, document, 'not a resource document');
  }

  if (!document.programmingPlanIds?.length) {
    return document;
  }

  const userLaboratory =
    userRole === 'LaboratoryUser'
      ? await laboratoryRepository.findUnique(user.laboratoryId as string)
      : undefined;

  const userProgrammingPlans = await programmingPlanRepository.findMany(
    buildFindProgrammingPlanOptions(user, userRole, {}, userLaboratory)
  );

  const userProgrammingPlanIds = userLaboratory
    ? userLaboratory.programmingPlanIds
    : userProgrammingPlans.map((plan) => plan.id);

  if (
    intersection(document.programmingPlanIds, userProgrammingPlanIds).length ===
    0
  ) {
    return denyAccess(user, userRole, document, 'out of programming scope');
  }

  return document;
};

export const getAndCheckSampleDocument = async (
  sampleId: string,
  documentId: string,
  user: UserBase,
  userRole: UserRole
): Promise<DocumentChecked> => {
  await getAndCheckSample(sampleId, user, userRole);

  const belongsToSample = await sampleRepository.documentBelongsToSample(
    documentId,
    sampleId
  );

  if (!belongsToSample) {
    console.warn('Sample document access denied', {
      who: user.id,
      role: userRole,
      sampleId,
      documentId,
      result: 'forbidden',
      reason: 'document not attached to sample'
    });
    throw new HttpError({
      status: constants.HTTP_STATUS_FORBIDDEN,
      name: 'DocumentOutOfScopeError',
      message: `Vous n'avez pas les droits sur ce document`
    });
  }

  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    throw new DocumentMissingError(documentId);
  }

  return document;
};
