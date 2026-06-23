import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { intersection, uniq } from 'lodash-es';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import {
  ResourceDocumentKindList,
  UploadDocumentKindList
} from 'maestro-shared/schema/Document/DocumentKind';
import { buildFindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { UserRoleList } from 'maestro-shared/schema/User/UserRole';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckDocument } from '../middlewares/checks/documentCheck';
import { documentRepository } from '../repositories/documentRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { documentService } from '../services/documentService';
import { notificationService } from '../services/notificationService';
import { s3Service } from '../services/s3Service';
import config from '../utils/config';

export const documentsRouter = {
  '/documents': {
    post: async ({ body: documentToCreate, user, userRole }) => {
      if (!UploadDocumentKindList.includes(documentToCreate.kind)) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        ResourceDocumentKindList.includes(documentToCreate.kind) &&
        !hasPermission(userRole, 'createResource')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        documentToCreate.kind === 'AnalysisReportDocument' &&
        !hasPermission(userRole, 'performAnalysis')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        documentToCreate.kind === 'SampleDocument' &&
        !hasPermission(userRole, 'createSample')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      console.log('Create document', documentToCreate);

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

      if (ResourceDocumentKindList.includes(documentToCreate.kind)) {
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
                hasPermission(role, 'readDocuments') &&
                role !== 'LaboratoryUser'
            ),
            programmingSubPlanIds: uniq(
              programmingPlans.flatMap((plan) =>
                plan.subPlans.map((sp) => sp.id)
              )
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
      }

      return {
        status: HttpStatus.CREATED,
        response: createdDocument
      };
    }
  },
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

      const result: { url: string; documentId: string } =
        await s3Service.getUploadSignedUrl(body.filename);

      return {
        status: HttpStatus.OK,
        response: result
      };
    }
  },
  '/documents/:documentId': {
    put: async ({ body: documentUpdate, user, userRole }, { documentId }) => {
      const document = await getAndCheckDocument(documentId, user, userRole);

      if (
        ![...ResourceDocumentKindList, 'SampleDocument'].includes(
          document.kind
        ) ||
        (document.kind === 'SampleDocument' &&
          !hasPermission(userRole, 'updateSample')) ||
        (ResourceDocumentKindList.includes(document.kind) &&
          !hasPermission(userRole, 'createResource'))
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

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
      const document = await getAndCheckDocument(documentId, user, userRole);

      if (!document?.kind || !UploadDocumentKindList.includes(document?.kind)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      if (
        ResourceDocumentKindList.includes(document.kind) &&
        !hasPermission(userRole, 'deleteDocument')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        document?.kind === 'SampleDocument' &&
        !hasPermission(userRole, 'deleteSampleDocument')
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      console.log('Delete document', documentId);

      await documentService.deleteDocument(documentId);
      return { status: HttpStatus.NO_CONTENT };
    },
    get: async ({ user, userRole }, { documentId }) => {
      console.info('Find document', documentId);

      const document = await getAndCheckDocument(documentId, user, userRole);

      return {
        status: HttpStatus.OK,
        response: document
      };
    }
  },
  '/documents/:documentId/download-signed-url': {
    get: async ({ user, userRole }, { documentId }) => {
      console.log('Get signed url for download document', documentId);

      const document = await getAndCheckDocument(documentId, user, userRole);

      const client = s3Service.getClient();
      const key = `${documentId}_${document.filename}`;

      const command = new GetObjectCommand({
        Bucket: config.s3.bucket,
        Key: key
      });

      const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });
      return {
        status: HttpStatus.OK,
        response: { url }
      };
    }
  }
} as const satisfies ProtectedSubRouter;
