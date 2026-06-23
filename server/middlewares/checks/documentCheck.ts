import { constants } from 'node:http2';
import { intersection, isNil } from 'lodash-es';
import DocumentMissingError from 'maestro-shared/errors/documentMissingError';
import { HttpError } from 'maestro-shared/errors/httpError';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { ResourceDocumentKindList } from 'maestro-shared/schema/Document/DocumentKind';
import { buildFindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  type UserBase,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import type { UserRole } from 'maestro-shared/schema/User/UserRole';
import { documentRepository } from '../../repositories/documentRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import { sampleRepository } from '../../repositories/sampleRepository';

const denyAccess = (
  user: UserBase,
  userRole: UserRole,
  document: DocumentChecked,
  reason: string
): never => {
  console.warn('Document access denied', {
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

// Resolve the document and make sure it belongs to the user's business scope.
// Resource documents are scoped by programmingPlanIds; every other kind is
// attached to a sample and scoped by its region. Deny by default: any document
// whose scope cannot be resolved is rejected.
export const getAndCheckDocument = async (
  documentId: string,
  user: UserBase,
  userRole: UserRole
): Promise<DocumentChecked> => {
  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    throw new DocumentMissingError(documentId);
  }

  if (ResourceDocumentKindList.includes(document.kind)) {
    // Resource without programming plan is a global resource, readable by any
    // user holding the role permission.
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
      intersection(document.programmingPlanIds, userProgrammingPlanIds)
        .length === 0
    ) {
      return denyAccess(user, userRole, document, 'out of programming scope');
    }

    return document;
  }

  const sample = await sampleRepository.findOneByDocumentId(documentId);

  if (isNil(sample)) {
    return denyAccess(user, userRole, document, 'no owning sample');
  }

  if (!userRegionsForRole(user, userRole).includes(sample.region)) {
    return denyAccess(user, userRole, document, 'out of region scope');
  }

  return document;
};
