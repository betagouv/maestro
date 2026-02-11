import sftp from 'ssh2-sftp-client';
import config from '../../utils/config';

import { readFileSync } from 'fs';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import path from 'path';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { unzip } from '../zipService';
import { processSachaRAI } from './sachaRAI';
import { sendSachaFile } from './sachaSender';
import { generateXMLAcquitement } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const doSftp = async () => {
  if (
    !config.sigal.sftp.privateKey ||
    !config.sigal.sftp.passphrase ||
    !config.sigal.sftp.host ||
    !config.sigal.sftp.username
  ) {
    console.warn(
      'La configuration de SFTP est incomplète. La récupération des résultats sur le SFTP est donc désactivée.'
    );
    return;
  }
  const sftpClient = new sftp();
  try {
    await sftpClient.connect({
      privateKey: config.sigal.sftp.privateKey,
      passphrase: config.sigal.sftp.passphrase,
      host: config.sigal.sftp.host,
      username: config.sigal.sftp.username
    });

    const sftpDirectory = path.join(tmpdir(), 'sftp');
    await sftpClient.downloadDir('uploads/RA01Maestro', sftpDirectory);

    const sachaConf = await sachaConfRepository.get();

    const dataDirectory = path.join(sftpDirectory, 'data');
    const zipFiles = await readdir(dataDirectory);

    for (const zipFile of zipFiles.filter((z) => !z.startsWith('Decl_'))) {
      if (zipFile.endsWith('.zip')) {
        await unzip(dataDirectory, zipFile);

        const unzipFile = path.join(
          dataDirectory,
          zipFile.substring(0, zipFile.length - 4)
        );

        const content = readFileSync(unzipFile);

        const json = validateAndDecodeSachaXml(content.toString());

        if (!json.Resultats) {
          throw new Error(`Aucun résultat trouvé dans ${zipFile}`);
        }

        //FIXME EDI gérer les erreurs et les non acquittements
        const { sampleItem, sample } = processSachaRAI(json.Resultats);
        if (!sampleItem.laboratoryId) {
          throw new Error(
            `Cet exemplaire n'est pas destiné à un laboratoire: ${sampleItem.sampleId} ${sampleItem.itemNumber} ${sampleItem.copyNumber}`
          );
        }

        await sftpClient.delete(`uploads/RA01Maestro/data/Decl_${zipFile}`);
        await sftpClient.delete(`uploads/RA01Maestro/data/${zipFile}`);

        await unlink(unzipFile);
        await unlink(path.join(dataDirectory, zipFile));
        await unlink(path.join(dataDirectory, `Decl_${zipFile}`));

        const dateNow = Date.now();
        const laboratory = await laboratoryRepository.findUnique(
          sampleItem.laboratoryId
        );
        const xml = await generateXMLAcquitement(
          [
            {
              NomFichier: json.Resultats.MessageParametres.NomFichier,
              DateAcquittement: toSachaDateTime(new Date(dateNow))
            }
          ],
          undefined,
          sample.department,
          dateNow,
          sachaConf,
          laboratory
        );

        await sendSachaFile(xml, dateNow);

        console.log('TODO Traitement de ', unzipFile, json);
      } else {
        console.warn(`Le fichier ${zipFile} n'est pas une archive`);
      }
    }
  } catch (e: any) {
    console.error(e.message);
  } finally {
    await sftpClient.end();
  }
};

await doSftp();
