import path from 'node:path';
import type { Readable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import type { AnalysisRaiId } from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import type sftp from 'ssh2-sftp-client';
import {
  type SachaOutgoingFileType,
  sachaOutgoingFileRepository
} from '../../repositories/sachaOutgoingFileRepository';
import { DaiProcessingError } from '../daiSendingService';
import { documentService } from '../documentService';
import { tchapService } from '../tchapService';
import { zip } from '../zipService';
import { getZipFileName, type XmlFile } from './sachaToXML';

const SACHA_OUTBOX = '/uploads/Maestro-Sigal-Labo';

export const assertSachaLaboratory = (laboratory: LaboratoryWithSacha) => {
  if (laboratory.sacha === null) {
    throw new DaiProcessingError(
      'Laboratoire en legacyDai routé par erreur vers SACHA',
      true,
      null
    );
  }
  if (laboratory.sacha.sigle === null) {
    throw new DaiProcessingError(
      'Sigle SACHA non renseigné pour ce laboratoire',
      true,
      'SFTP'
    );
  }
  if (!laboratory.sacha.activated) {
    throw new DaiProcessingError(
      'EDI Sacha désactivé pour ce laboratoire',
      true,
      'SFTP'
    );
  }
};

export const queueSachaAcknowledgement = async (
  xmlFile: XmlFile,
  laboratory: LaboratoryWithSacha,
  analysisRaiId: AnalysisRaiId
): Promise<void> => {
  const documentId = await documentService.insertDocument(
    new File([xmlFile.content], `${xmlFile.fileName}.xml`, {
      type: 'application/xml'
    }),
    'SachaAcknowledgementFile',
    null
  );
  await sachaOutgoingFileRepository.insert({
    fileType: 'AN01',
    fileName: xmlFile.fileName,
    laboratoryId: laboratory.id,
    documentId,
    analysisRaiId
  });
};

const readDocument = async (documentId: string): Promise<Buffer> => {
  const document = await documentService.getDocument(documentId);
  if (!document) {
    throw new Error(`Document ${documentId} introuvable`);
  }
  return buffer(document.file as Readable);
};

const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

const depositFileType = async (
  sftpClient: Pick<sftp, 'put' | 'delete'>,
  fileType: SachaOutgoingFileType,
  dateNow: number
): Promise<void> => {
  const files = await sachaOutgoingFileRepository.findUndeposited(fileType);
  if (files.length === 0) {
    return;
  }

  const zipName = getZipFileName(fileType, dateNow);
  const zipPath = `${SACHA_OUTBOX}/${fileType}/${zipName}`;
  const triggerPath = `${SACHA_OUTBOX}/${fileType}/Decl_${path.basename(zipName, '.zip')}`;

  const entries = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => [
        `${file.sachaSigle.toUpperCase()}/${file.fileName}.xml`,
        await readDocument(file.documentId)
      ])
    )
  );

  await sftpClient.put(Buffer.from(zip(entries)), zipPath);
  try {
    await sftpClient.put(Buffer.alloc(0), triggerPath);
  } catch (e) {
    await sftpClient
      .delete(zipPath, true)
      .catch((deleteError) =>
        console.error(`[SFTP] Zip orphelin ${zipPath} :`, deleteError)
      );
    throw e;
  }

  await sachaOutgoingFileRepository.markDeposited(
    files.map((file) => file.id),
    zipName,
    new Date()
  );
  console.info(`[SFTP] ${zipName} déposé (${files.length} fichier(s))`);
};

export const depositSachaFiles = async (
  sftpClient: Pick<sftp, 'put' | 'delete'>,
  dateNow: number
): Promise<void> => {
  for (const fileType of ['DA01', 'AN01'] as const) {
    try {
      await depositFileType(sftpClient, fileType, dateNow);
    } catch (e) {
      console.error(`[SFTP] Échec du dépôt ${fileType} :`, e);
      await tchapService.send(
        `[Maestro] Échec du dépôt SACHA ${fileType}, nouvel essai au prochain cycle : ${errorMessage(e)}`
      );
    }
  }
};
