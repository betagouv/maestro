import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AnalysisDaiSentMethod } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiSentMethod';
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
  laboratorySachaSftpLogin: string | null
): Promise<AnalysisDaiSentMethod> => {
  const sentMethod: AnalysisDaiSentMethod = laboratorySachaSftpLogin
    ? 'SFTP'
    : 'EMAIL';

  if (!config.sachaEnabled) {
    throw new DaiProcessingError('EDI Sacha désactivé', true, sentMethod);
  }

  // Create directory with xml file inside
  const directoryPath = path.join(tmpdir(), xmlFile.fileName);
  await mkdir(directoryPath);

  const filePath = path.join(directoryPath, `${xmlFile.fileName}.xml`);
  await writeFile(filePath, xmlFile.content);

  // Zip directory
  const zipFileName = getZipFileName(
    xmlFile.fileType,
    xmlFile.laboratory,
    dateNow
  );
  const zipFilePath = await zip(directoryPath, zipFileName);

  if (sentMethod === 'EMAIL') {
    // Encrypt
    const laboratoryGpgEmail = xmlFile.laboratory.sachaEmail;
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
  } else {
    if (
      !config.sigal.sftp.privateKey ||
      !config.sigal.sftp.passphrase ||
      !config.sigal.sftp.host ||
      !laboratorySachaSftpLogin
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
        username: laboratorySachaSftpLogin
      });

      await sftpClient.fastPut(
        zipFilePath,
        `/uploads/masa_labo/data/${zipFileName}`
      );
    } catch (e) {
      throw new DaiProcessingError(
        `Échec de l'envoi SFTP (${laboratorySachaSftpLogin}): ${e instanceof Error ? e.message : String(e)}`,
        true,
        sentMethod
      );
    } finally {
      await sftpClient.end();
    }
  }

  return sentMethod;
};
