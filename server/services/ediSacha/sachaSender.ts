import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sftp from 'ssh2-sftp-client';
import config from '../../utils/config';
import { encryptFile } from '../gpgService';
import { mailService } from '../mailService';
import { zip } from '../zipService';
import { getZipFileName, type XmlFile } from './sachaToXML';

export const sendSachaFile = async (
  xmlFile: XmlFile,
  dateNow: number,
  laboratorySachaSftpLogin: string | null
) => {
  if (!config.sachaEnabled) {
    return;
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

  if (laboratorySachaSftpLogin === null) {
    // Encrypt
    const laboratoryGpgEmail = xmlFile.laboratory.sachaEmail;
    const encryptFileName = `${zipFileName}.gpg`;
    const encryptFilePath = await encryptFile(
      zipFilePath,
      laboratoryGpgEmail,
      encryptFileName
    );
    const encryptFileBuffer = await readFile(encryptFilePath);

    // Send by email
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
      !config.sigal.sftp.host
    ) {
      console.warn('La configuration de SFTP est incomplète.');
      return;
    }
    const sftpClient = new sftp();
    await sftpClient.connect({
      privateKey: config.sigal.sftp.privateKey,
      passphrase: config.sigal.sftp.passphrase,
      host: config.sigal.sftp.host,
      username: laboratorySachaSftpLogin
    });

    await sftpClient.fastPut(zipFilePath, `/`);
  }
};
