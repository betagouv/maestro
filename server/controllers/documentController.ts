import { intersection, uniq } from 'lodash-es';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { ResourceDocumentKindList } from 'maestro-shared/schema/Document/DocumentKind';
import { buildFindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { UserRoleList } from 'maestro-shared/schema/User/UserRole';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckResourceDocument } from '../middlewares/checks/documentCheck';
import { documentRepository } from '../repositories/documentRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { documentService } from '../services/documentService';
import { notificationService } from '../services/notificationService';
import { s3Service } from '../services/s3Service';

export const documentsRouter = {
  '/documents/resources': {
    get: async ({ query, user, userRole }) => {
      console.info('Find documents');

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

      const filteredProgrammingPlanIds = query.programmingPlanIds?.length
        ? intersection(query.programmingPlanIds, userProgrammingPlanIds)
        : userProgrammingPlanIds;

      const documents = await documentRepository.findMany({
        kinds: ResourceDocumentKindList,
        programmingPlanIds: filteredProgrammingPlanIds,
        includeNoProgrammingPlan: !query.programmingPlanIds?.length,
        year: query.year ?? undefined
      });

      return {
        status: HttpStatus.OK,
        response: documents
      };
    },
    post: async ({ body: documentToCreate, user }) => {
      console.log('Create resource document', documentToCreate);

      const document: DocumentChecked = {
        ...documentToCreate,
        createdAt: new Date(),
        createdBy: user.id
      };

      await documentRepository.insert(document);

      const createdDocument = await documentRepository.findUnique(document.id);

      if (!createdDocument) {
        throw new Error('Document not found after insert');
      }

      const laboratoriesForDocument = await laboratoryRepository.findMany({
        programmingPlanIds: document.programmingPlanIds
      });

      const laboratoryUsers = laboratoriesForDocument.length
        ? await userRepository.findMany({
            roles: ['LaboratoryUser'],
            laboratoryIds: laboratoriesForDocument.map((lab) => lab.id)
          })
        : [];

      const programmingPlans = await programmingPlanRepository.findMany({
        ids: document.programmingPlanIds
      });

      const otherUserConcernedByProgrammingPlans =
        await userRepository.findMany({
          roles: UserRoleList.filter(
            (role) =>
              hasPermission(role, 'readDocuments') && role !== 'LaboratoryUser'
          ),
          programmingSubPlanIds: uniq(
            programmingPlans.flatMap((plan) => plan.subPlans.map((sp) => sp.id))
          )
        });

      await notificationService.sendNotification(
        {
          category: 'ResourceDocumentUploaded',
          author: user,
          link: AppRouteLinks.DocumentsRoute.link({ documentId: document.id })
        },
        [...laboratoryUsers, ...otherUserConcernedByProgrammingPlans].filter(
          (_) => _.id !== user.id
        ),
        {
          object: 'Nouveau document disponible',
          content: `Une nouvelle ressource a été ajoutée ou mise à jour.
            **${document.name}**`
        }
      );

      return {
        status: HttpStatus.CREATED,
        response: createdDocument
      };
    }
  },
  '/documents/resources/:documentId': {
    get: async ({ user, userRole }, { documentId }) => {
      console.info('Find resource document', documentId);

      const document = await getAndCheckResourceDocument(
        documentId,
        user,
        userRole
      );

      return {
        status: HttpStatus.OK,
        response: document
      };
    },
    put: async ({ body: documentUpdate, user, userRole }, { documentId }) => {
      const document = await getAndCheckResourceDocument(
        documentId,
        user,
        userRole
      );

      const updatedDocument = {
        ...document,
        ...documentUpdate,
        programmingPlanIds: documentUpdate.programmingPlanIds
      };

      await documentRepository.update(updatedDocument);

      return {
        status: HttpStatus.OK,
        response: updatedDocument
      };
    },
    delete: async ({ user, userRole }, { documentId }) => {
      await getAndCheckResourceDocument(documentId, user, userRole);

      console.log('Delete resource document', documentId);

      await documentService.deleteDocument(documentId);
      return { status: HttpStatus.NO_CONTENT };
    }
  },
  '/documents/resources/:documentId/download-signed-url': {
    get: async ({ user, userRole }, { documentId }) => {
      console.log('Get signed url for download resource document', documentId);

      const document = await getAndCheckResourceDocument(
        documentId,
        user,
        userRole
      );

      const url = await s3Service.getDownloadSignedUrl(
        documentId,
        document.filename
      );
      return {
        status: HttpStatus.OK,
        response: { url }
      };
    }
  },
  '/documents/upload-signed-url': {
    post: async ({ userRole, body }) => {
      if (
        ResourceDocumentKindList.includes(body.kind) &&
        !hasPermission(userRole, 'createResource')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        body.kind === 'AnalysisReportDocument' &&
        !hasPermission(userRole, 'performAnalysis')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        body.kind === 'SampleDocument' &&
        !hasPermission(userRole, 'createSample')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const result: { url: string; documentId: string } =
        await s3Service.getUploadSignedUrl(body.filename);

      return {
        status: HttpStatus.OK,
        response: result
      };
    }
  }
} as const satisfies ProtectedSubRouter;
