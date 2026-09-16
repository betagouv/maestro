import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import sftp from 'ssh2-sftp-client';
import config from '../../utils/config';
import { DaiProcessingError } from '../daiSendingService';
import { zip } from '../zipService';
import { getZipFileName, type XmlFile } from './sachaToXML';

const SACHA_OUTBOX = '/uploads/Maestro-Sigal-Labo';

//FIXME à supprimer, c'est juste pour un test grandeur nature
const SEND_ZIP_AND_TRIGGER: boolean = false;

export const sendSachaFile = async (
  xmlFile: XmlFile,
  dateNow: number,
  laboratory: LaboratoryWithSacha
): Promise<void> => {
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
  if (
    !config.sigal.sftp.privateKey ||
    !config.sigal.sftp.passphrase ||
    !config.sigal.sftp.host ||
    !config.sigal.sftp.username
  ) {
    throw new DaiProcessingError(
      'La configuration SFTP est incomplète',
      true,
      'SFTP'
    );
  }

  const directory = `${SACHA_OUTBOX}/${xmlFile.fileType}/${laboratory.sacha.sigle.toUpperCase()}`;

  const directoryPath = path.join(tmpdir(), xmlFile.fileName);
  await mkdir(directoryPath, { recursive: true });

  const filePath = path.join(directoryPath, `${xmlFile.fileName}.xml`);
  await writeFile(filePath, xmlFile.content);

  const zipFileName = getZipFileName(
    xmlFile.fileType,
    laboratory.sacha.sigle,
    dateNow
  );
  const zipFilePath = await zip(directoryPath, zipFileName);
  const triggerFileName = path.basename(zipFileName, '.zip');

  const sftpClient = new sftp();
  try {
    await sftpClient.connect({
      privateKey: config.sigal.sftp.privateKey,
      passphrase: config.sigal.sftp.passphrase,
      host: config.sigal.sftp.host,
      username: config.sigal.sftp.username
    });

    await sftpClient.put(
      Buffer.from(xmlFile.content),
      `${directory}/${xmlFile.fileName}.xml`
    );

    if (SEND_ZIP_AND_TRIGGER) {
      await sftpClient.fastPut(zipFilePath, `${directory}/${zipFileName}`);
      await sftpClient.put(
        Buffer.alloc(0),
        `${directory}/Ack_${triggerFileName}`
      );
    }
  } catch (e) {
    throw new DaiProcessingError(
      `Échec de l'envoi SFTP (${xmlFile.fileName}): ${e instanceof Error ? e.message : String(e)}`,
      true,
      'SFTP'
    );
  } finally {
    await sftpClient.end();
  }
};
