import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { SachaCommunicationMethod } from 'maestro-shared/schema/Laboratory/SachaCommunicationMethod';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import sftp from 'ssh2-sftp-client';
import config from '../../utils/config';
import { DaiProcessingError } from '../daiSendingService';
import { encryptFile } from '../gpgService';
import { mailService } from '../mailService';
import { zip } from '../zipService';
import { getZipFileName, type XmlFile } from './sachaToXML';

export const sendSachaFile = async (
  xmlFile: XmlFile,
  dateNow: number,
  laboratory: LaboratoryWithSacha
): Promise<SachaCommunicationMethod> => {
  if (laboratory.sacha === null) {
    throw new DaiProcessingError(
      'Laboratoire en legacyDai routé par erreur vers SACHA',
      true,
      null
    );
  }
  if (laboratory.sacha.communication === null) {
    throw new DaiProcessingError(
      'Configuration SACHA en attente pour ce laboratoire',
      true,
      null
    );
  }
  if (laboratory.sacha.sigle === null) {
    throw new DaiProcessingError(
      'Sigle SACHA non renseigné pour ce laboratoire',
      true,
      laboratory.sacha.communication.method
    );
  }
  if (!laboratory.sacha.activated) {
    throw new DaiProcessingError(
      'EDI Sacha désactivé pour ce laboratoire',
      true,
      laboratory.sacha.communication.method
    );
  }

  const sentMethod: SachaCommunicationMethod =
    laboratory.sacha.communication.method;

  // Create directory with xml file inside
  const directoryPath = path.join(tmpdir(), xmlFile.fileName);
  await mkdir(directoryPath);

  const filePath = path.join(directoryPath, `${xmlFile.fileName}.xml`);
  await writeFile(filePath, xmlFile.content);

  // Zip directory
  const zipFileName = getZipFileName(
    xmlFile.fileType,
    laboratory.sacha.sigle,
    dateNow
  );
  const zipFilePath = await zip(directoryPath, zipFileName);

  switch (laboratory.sacha.communication.method) {
    case 'EMAIL': {
      const laboratoryGpgEmail = laboratory.sacha.communication.email;
      const encryptFileName = `${zipFileName}.gpg`;
      const encryptFilePath = await encryptFile(
        zipFilePath,
        laboratoryGpgEmail,
        encryptFileName
      );
      const encryptFileBuffer = await readFile(encryptFilePath);

      await mailService.send({
        templateName: 'GenericTemplate',
        attachment: [
          {
            name: encryptFileName,
            content: Buffer.from(encryptFileBuffer).toString('base64')
          }
        ],
        recipients: [laboratoryGpgEmail],
        params: {
          object: zipFileName,
          content: zipFileName
        }
      });
      break;
    }
    case 'SFTP': {
      if (
        !config.sigal.sftp.privateKey ||
        !config.sigal.sftp.passphrase ||
        !config.sigal.sftp.host
      ) {
        throw new DaiProcessingError(
          'La configuration SFTP est incomplète',
          true,
          'SFTP'
        );
      }
      const sftpClient = new sftp();
      try {
        await sftpClient.connect({
          privateKey: config.sigal.sftp.privateKey,
          passphrase: config.sigal.sftp.passphrase,
          host: config.sigal.sftp.host,
          username: laboratory.sacha.communication.sftpLogin
        });

        await sftpClient.fastPut(
          zipFilePath,
          `/uploads/masa_labo/data/${zipFileName}`
        );
      } catch (e) {
        throw new DaiProcessingError(
          `Échec de l'envoi SFTP (${laboratory.sacha.communication.sftpLogin}): ${e instanceof Error ? e.message : String(e)}`,
          true,
          sentMethod
        );
      } finally {
        await sftpClient.end();
      }
      break;
    }
    default:
      assertUnreachable(laboratory.sacha.communication);
  }

  return sentMethod;
};
