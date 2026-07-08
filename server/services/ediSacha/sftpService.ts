import fs, { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { promisify } from 'node:util';
import type { AnalysisRai } from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import sftp from 'ssh2-sftp-client';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import type { SachaConf } from '../../repositories/kysely.type';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import config from '../../utils/config';
import { documentService } from '../documentService';
import { mattermostService } from '../mattermostService';
import { unzip } from '../zipService';
import { RaiMaestroError, RaiProcessingError } from './sachaErrors';
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

export const processSachaContent = async (
  content: Buffer,
  xmlDocumentId: string,
  sachaConf: SachaConf
): Promise<{ laboratoryId: string }> => {
  const json = validateAndDecodeSachaXml(content.toString(), xmlDocumentId);

  if (!json.Resultats) {
    throw new RaiProcessingError(`Aucun résultat`, xmlDocumentId);
  }

  const { laboratoryId, department } = await processSachaRAI(
    json.Resultats,
    xmlDocumentId
  );

  const dateNow = Date.now();
  const laboratory = await laboratoryRepository.findUnique(laboratoryId);
  const xml = await generateXMLAcquitement(
    [
      {
        NomFichier: json.Resultats.MessageParametres.NomFichier,
        DateAcquittement: toSachaDateTime(new Date(dateNow))
      }
    ],
    undefined,
    department,
    dateNow,
    sachaConf,
    laboratory
  );

  await sendSachaFile(xml, dateNow, laboratory);

  return { laboratoryId };
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

  const { laboratoryId } = await processSachaContent(
    content,
    xmlDocumentId,
    sachaConf
  );

  // Suppression après succès complet
  await sftpClient.delete(`uploads/RA01Maestro/data/${zipFile}`);
  await sftpClient.delete(`uploads/RA01Maestro/data/Decl_${zipFile}`);
  await unlink(unzipFile);
  await unlink(path.join(dataDirectory, zipFile));
  await unlink(path.join(dataDirectory, `Decl_${zipFile}`));

  return {
    laboratoryId,
    xmlDocumentId
  };
};

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export const replayRai = async (
  rai: Extract<AnalysisRai, { source: 'SFTP' }>
): Promise<void> => {
  const raiDocuments = await analysisRaiRepository.findLinkedDocuments(rai.id);

  const xmlDocument = raiDocuments.find((r) =>
    r.filename.toLowerCase().endsWith('.xml')
  );
  if (!xmlDocument) {
    throw new Error('Aucun document XML lié à cette RAI SFTP.');
  }
  const doc = await documentService.getDocument(xmlDocument.id);
  if (!doc) {
    throw new Error(`Document XML ${xmlDocument.id} introuvable.`);
  }
  const content = await streamToBuffer(doc.file as Readable);

  const sachaConf = await sachaConfRepository.get();
  const { laboratoryId } = await processSachaContent(
    content,
    xmlDocument.id,
    sachaConf
  );
  await analysisRaiRepository.update(rai.id, {
    state: 'PROCESSED',
    laboratoryId,
    message: null
  });
};

export const doSftp = async () => {
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

      try {
        const { xmlDocumentId, laboratoryId } = await processSachaFile(
          sftpClient,
          sachaConf,
          dataDirectory,
          zipFile
        );
        await insertRai('PROCESSED', laboratoryId, null, xmlDocumentId);
      } catch (e: any) {
        const isLabError =
          e instanceof RaiProcessingError && !(e instanceof RaiMaestroError);
        //FIXME EDI les non acquittements pour les erreurs labo
        console.error(`[SFTP] Erreur sur ${zipFile} :`, e.message);
        await insertRai(
          'ERROR',
          null,
          e.message,
          e instanceof RaiProcessingError ? e.xmlDocumentId : null
        );
        await mattermostService.send(
          `[Maestro] Erreur RAI EDI${isLabError ? '' : ' interne'} (file=${zipFile}) : ${e.message}`
        );
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
