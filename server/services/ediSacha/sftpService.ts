import sftp from 'ssh2-sftp-client';
import config from '../../utils/config';

import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import path from 'path';

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

    const files = await readdir(path.join(sftpDirectory, 'data'));
    console.info('test', files);

    for (const file of files) {
      //FIXME EDI On doit supprimer le fichier déclencheur dans decl
      //FIXME EDI On doit supprimer le fichier de data

      console.log('TODO Traitement de ', file);
    }
  } catch (e: any) {
    console.error(e.message);
  } finally {
    await sftpClient.end();
  }
};

await doSftp();
