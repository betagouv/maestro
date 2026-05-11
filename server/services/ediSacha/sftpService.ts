import fs, { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import sftp from 'ssh2-sftp-client';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import type { SachaConf } from '../../repositories/kysely.type';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import config from '../../utils/config';
import { documentService } from '../documentService';
import { mattermostService } from '../mattermostService';
import { unzip } from '../zipService';
import { RaiProcessingError } from './sachaErrors';
import { processSachaRAI } from './sachaRAI';
import { sendSachaFile } from './sachaSender';
import { generateXMLAcquitement } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

type SachaSuccess = {
  laboratoryId: string;
  xmlDocumentId: string;
};

const processSachaFile = async (
  sftpClient: sftp,
  sachaConf: SachaConf,
  dataDirectory: string,
  zipFile: string
): Promise<SachaSuccess> => {
  await unzip(dataDirectory, zipFile);

  const filename = zipFile.substring(0, zipFile.length - 4);

  const unzipFile = path.join(dataDirectory, filename);

  const content = readFileSync(unzipFile);

  const xmlFile = new File([new Uint8Array(content)], filename, {
    type: 'application/xml'
  });
  const xmlDocumentId = await documentService.insertDocument(
    xmlFile,
    'RaiSourceFile',
    null
  );

  const json = validateAndDecodeSachaXml(content.toString(), xmlDocumentId);

  if (!json.Resultats) {
    throw new RaiProcessingError(`Aucun résultat (${zipFile})`, xmlDocumentId);
  }

  const { sampleItem, sample } = processSachaRAI(json.Resultats);
  if (!sampleItem.laboratoryId) {
    throw new RaiProcessingError(
      `Aucun laboratoire (${zipFile})`,
      xmlDocumentId
    );
  }

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

  await sendSachaFile(xml, dateNow, laboratory);

  // Suppression après succès complet
  await sftpClient.delete(`uploads/RA01Maestro/data/${zipFile}`);
  await sftpClient.delete(`uploads/RA01Maestro/data/Decl_${zipFile}`);
  await unlink(unzipFile);
  await unlink(path.join(dataDirectory, zipFile));
  await unlink(path.join(dataDirectory, `Decl_${zipFile}`));

  return {
    laboratoryId: sampleItem.laboratoryId,
    xmlDocumentId
  };
};

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
      if (!zipFile.endsWith('.zip')) {
        console.warn(`Le fichier ${zipFile} n'est pas une archive`);
        continue;
      }

      const receivedAt = new Date();
      const insertRai = async (
        state: 'PROCESSED' | 'ERROR',
        laboratoryId: string | null,
        message: string | null,
        xmlDocumentId: string | null
      ) => {
        const raiId = await analysisRaiRepository.insert({
          source: 'SFTP',
          edi: true,
          analysisId: null,
          laboratoryId,
          receivedAt,
          state,
          payload: null,
          message
        });
        if (xmlDocumentId !== null) {
          await analysisRaiRepository.linkDocuments(raiId, [xmlDocumentId]);
        }
      };

      const recordFailure = async (
        message: string,
        xmlDocumentId: string | null
      ) => {
        //FIXME EDI  les non acquittements
        // Erreur métier : le fichier reste sur le SFTP pour la prochaine exécution
        console.error(`[SFTP] Erreur sur ${zipFile}:`, message);
        await insertRai('ERROR', null, message, xmlDocumentId);
        await mattermostService.send(
          `[Maestro] Erreur RAI EDI (file=${zipFile}) : ${message}`
        );
      };

      try {
        const { xmlDocumentId, laboratoryId } = await processSachaFile(
          sftpClient,
          sachaConf,
          dataDirectory,
          zipFile
        );
        await insertRai('PROCESSED', laboratoryId, null, xmlDocumentId);
      } catch (e: any) {
        if (e instanceof RaiProcessingError) {
          await recordFailure(e.message, e.xmlDocumentId);
        } else {
          await recordFailure(e.message, null);
        }
      }
    }
  } catch (e: any) {
    console.error(e.message);

    await mattermostService.send(
      `[Maestro] Erreur RAI, impossible de se connecter au SFTP`
    );
  } finally {
    await sftpClient.end();
  }
};

//FIXME remove
await doSftp();
