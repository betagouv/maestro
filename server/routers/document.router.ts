import express from 'express';
import { z } from 'zod';
import { DocumentToCreate } from '../../shared/schema/Document/Document';
import documentController from '../controllers/documentController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.post(
  '/upload-signed-url',
  validator.validate(body(z.object({ filename: z.string() }))),
  permissionsCheck(['createDocument']),
  documentController.getUploadSignedUrl
);

router.post(
  '',
  validator.validate(body(DocumentToCreate)),
  permissionsCheck(['createDocument']),
  documentController.createDocument
);

router.get(
  '',
  permissionsCheck(['readDocuments']),
  documentController.findDocuments
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
