import express from 'express';
import {
  DocumentToCreate,
  DocumentUpdate
} from 'maestro-shared/schema/Document/Document';
import documentController from '../controllers/documentController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.post(
  '/upload-signed-url',
  validator.validate(body(DocumentToCreate.omit({ id: true }))),
  permissionsCheck(['createResource', 'createAnalysis', 'createSample']),
  documentController.getUploadSignedUrl
);

router.post(
  '',
  validator.validate(body(DocumentToCreate)),
  permissionsCheck(['createResource', 'createAnalysis', 'createSample']),
  documentController.createDocument
);

router.get(
  '/resources',
  permissionsCheck(['readDocuments']),
  documentController.findResources
);

router.get(
  '/:documentId',
  validator.validate(uuidParam('documentId')),
  permissionsCheck(['readDocuments']),
  documentController.getDocument
);

router.get(
  '/:documentId/download-signed-url',
  validator.validate(uuidParam('documentId')),
  permissionsCheck(['readDocuments']),
  documentController.getDownloadSignedUrl
);

router.put(
  '/:documentId',
  validator.validate(uuidParam('documentId').merge(body(DocumentUpdate))),
  permissionsCheck(['createSample']),
  documentController.updateDocument
);

router.delete(
  '/:documentId',
  validator.validate(uuidParam('documentId')),
  permissionsCheck(['deleteDocument', 'deleteSampleDocument']),
  documentController.deleteDocument
);

export default router;
