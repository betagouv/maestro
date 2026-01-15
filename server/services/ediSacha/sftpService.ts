import sftp from 'ssh2-sftp-client';
import config from '../../utils/config';

import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import path from 'path';
import { unzip } from '../zipService';

const readdir = promisify(fs.readdir);

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

    const dataDirectory = path.join(sftpDirectory, 'data');
    const files = await readdir(dataDirectory);

    for (const file of files) {
      if (file.endsWith('.zip')) {
        await unzip(dataDirectory, file);

        //FIXME EDI On doit supprimer le fichier déclencheur dans decl
        //FIXME EDI On doit supprimer le fichier de data

        //FIXME EDI Envoie de l'acquittement
        console.log('TODO Traitement de ', file);
      } else {
        console.warn(`Le fichier ${file} n'est pas une archive`);
      }
    }
  } catch (e: any) {
    console.error(e.message);
  } finally {
    await sftpClient.end();
  }
};

await doSftp();
