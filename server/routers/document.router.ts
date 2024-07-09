import express from 'express';
import { DocumentToCreate } from '../../shared/schema/Document/Document';
import documentController from '../controllers/documentController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.post(
  '/upload-signed-url',
  validator.validate(body(DocumentToCreate.omit({ id: true }))),
  permissionsCheck(['createResource', 'createAnalysis']),
  documentController.getUploadSignedUrl
);

router.post(
  '',
  validator.validate(body(DocumentToCreate)),
  permissionsCheck(['createResource', 'createAnalysis']),
  documentController.createDocument
);

router.get(
  '/resources',
  permissionsCheck(['readDocuments']),
  documentController.findResources
);

router.get(
  '/:documentId/download-signed-url',
  validator.validate(uuidParam('documentId')),
  permissionsCheck(['readDocuments']),
  documentController.getDownloadSignedUrl
);

router.delete(
  '/:documentId',
  validator.validate(uuidParam('documentId')),
  permissionsCheck(['deleteDocument']),
  documentController.deleteDocument
);

export default router;
