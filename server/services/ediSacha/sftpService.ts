import fs, { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { promisify } from 'node:util';
import { Department } from 'maestro-shared/referential/Department';
import type {
  AnalysisRai,
  AnalysisRaiState
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import sftp from 'ssh2-sftp-client';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import type { SachaConf } from '../../repositories/kysely.type';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import config from '../../utils/config';
import { documentService } from '../documentService';
import { mattermostService } from '../mattermostService';
import { RaiLabError } from './sachaErrors';
import { processSachaRAI } from './sachaRAI';
import { sendSachaFile } from './sachaSender';
import { generateXMLAcquitement } from './sachaToXML';
import type { SachaResultats } from './sachaValidator';
import { resultatsMessageValidator, toSachaDateTime } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

type Envelope = {
  senderSigle: string;
  recipientSigle: string;
  nomFichier: string;
};

type DecodedContent =
  | { kind: 'valid'; envelope: Envelope; resultats: SachaResultats }
  | { kind: 'invalid'; envelope: Envelope; detail: string }
  | { kind: 'internalError'; message: string };

type RaiOutcome =
  | {
      kind: 'ACK';
      analysisId: string;
      laboratoryId: string;
      department: Department;
    }
  | { kind: 'NACK'; motif: string }
  | { kind: 'INTERNAL_ERROR'; laboratoryId: string | null; message: string };

type RaiResponse = {
  state: AnalysisRaiState;
  analysisId: string | null;
  laboratoryId: string | null;
  message: string | null;
};

const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

const envelopeFromFileName = (fileName: string): Envelope | null => {
  const nomFichier = fileName.replace(/\.xml$/i, '');
  const match = nomFichier.match(/^RA01(.+?)(M?DDSV\w{2,3})\d{15}$/);
  if (!match) {
    return null;
  }
  return { senderSigle: match[1], recipientSigle: match[2], nomFichier };
};

const decodeEnvelope = (
  content: string,
  xmlDocumentId: string | null,
  fileName: string
): DecodedContent => {
  try {
    const { Resultats } = validateAndDecodeSachaXml(
      content,
      resultatsMessageValidator,
      xmlDocumentId
    );
    return {
      kind: 'valid',
      envelope: {
        senderSigle: Resultats.Emetteur.Sigle,
        recipientSigle: Resultats.Destinataire.Sigle,
        nomFichier: Resultats.MessageParametres.NomFichier
      },
      resultats: Resultats
    };
  } catch (e) {
    if (e instanceof RaiLabError) {
      const envelope = envelopeFromFileName(fileName);
      if (envelope) {
        return { kind: 'invalid', envelope, detail: errorMessage(e) };
      }
      return {
        kind: 'internalError',
        message: `XML invalide et nom de fichier non adressable (${fileName}) : ${errorMessage(e)}`
      };
    }
    return { kind: 'internalError', message: errorMessage(e) };
  }
};

const processResultats = async (
  resultats: SachaResultats,
  xmlDocumentId: string | null
): Promise<RaiOutcome> => {
  try {
    const { analysisId, laboratoryId, department } = await processSachaRAI(
      resultats,
      xmlDocumentId
    );
    return { kind: 'ACK', analysisId, laboratoryId, department };
  } catch (e) {
    if (e instanceof RaiLabError) {
      return { kind: 'NACK', motif: e.message };
    }
    return {
      kind: 'INTERNAL_ERROR',
      laboratoryId: null,
      message: errorMessage(e)
    };
  }
};

const departmentFromSigle = (sigle: string): Department | null => {
  const parsed = Department.safeParse(sigle.replace(/^M?DDSV/, ''));
  return parsed.success ? parsed.data : null;
};

const respond = async (
  envelope: Envelope,
  outcome: RaiOutcome,
  sachaConf: SachaConf
): Promise<RaiResponse> => {
  switch (outcome.kind) {
    case 'ACK': {
      try {
        const dateNow = Date.now();
        const laboratory = await laboratoryRepository.findUnique(
          outcome.laboratoryId
        );
        const xml = await generateXMLAcquitement(
          [
            {
              NomFichier: envelope.nomFichier,
              DateAcquittement: toSachaDateTime(new Date(dateNow))
            }
          ],
          undefined,
          outcome.department,
          dateNow,
          sachaConf,
          laboratory
        );
        await sendSachaFile(xml, dateNow, laboratory);
        return {
          state: 'PROCESSED',
          analysisId: outcome.analysisId,
          laboratoryId: outcome.laboratoryId,
          message: null
        };
      } catch (e) {
        return {
          state: 'INTERNAL_ERROR',
          analysisId: outcome.analysisId,
          laboratoryId: outcome.laboratoryId,
          message: errorMessage(e)
        };
      }
    }
    case 'NACK': {
      const laboratory = await laboratoryRepository.findBySachaSigle(
        envelope.senderSigle
      );
      const department = departmentFromSigle(envelope.recipientSigle);
      if (!laboratory || !department) {
        return {
          state: 'INTERNAL_ERROR',
          analysisId: null,
          laboratoryId: laboratory?.id ?? null,
          message: `Non-acquittement non adressable (émetteur=${envelope.senderSigle}, destinataire=${envelope.recipientSigle}) : ${outcome.motif}`
        };
      }
      try {
        const dateNow = Date.now();
        const xml = await generateXMLAcquitement(
          undefined,
          [
            {
              NomFichier: envelope.nomFichier,
              LibelleMotif: outcome.motif,
              DateNonAcquittement: toSachaDateTime(new Date(dateNow))
            }
          ],
          department,
          dateNow,
          sachaConf,
          laboratory
        );
        await sendSachaFile(xml, dateNow, laboratory);
        return {
          state: 'REJECTED',
          analysisId: null,
          laboratoryId: laboratory.id,
          message: outcome.motif
        };
      } catch (e) {
        return {
          state: 'INTERNAL_ERROR',
          analysisId: null,
          laboratoryId: laboratory.id,
          message: errorMessage(e)
        };
      }
    }
    case 'INTERNAL_ERROR':
      return {
        state: 'INTERNAL_ERROR',
        analysisId: null,
        laboratoryId: outcome.laboratoryId,
        message: outcome.message
      };
    default:
      return assertUnreachable(outcome);
  }
};

export const processSachaContent = async (
  content: Buffer,
  xmlDocumentId: string,
  sachaConf: SachaConf,
  fileName: string
): Promise<RaiResponse> => {
  const decoded = decodeEnvelope(content.toString(), xmlDocumentId, fileName);
  if (decoded.kind === 'internalError') {
    return {
      state: 'INTERNAL_ERROR',
      analysisId: null,
      laboratoryId: null,
      message: decoded.message
    };
  }
  const outcome: RaiOutcome =
    decoded.kind === 'valid'
      ? await processResultats(decoded.resultats, xmlDocumentId)
      : { kind: 'NACK', motif: `fichier invalide : ${decoded.detail}` };
  return respond(decoded.envelope, outcome, sachaConf);
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
  const response = await processSachaContent(
    content,
    xmlDocument.id,
    sachaConf,
    xmlDocument.filename
  );
  await analysisRaiRepository.update(rai.id, {
    state: response.state,
    analysisId: response.analysisId,
    laboratoryId: response.laboratoryId,
    message: response.message
  });
};

const safeUnlink = async (filePath: string): Promise<void> => {
  try {
    await unlink(filePath);
  } catch (e) {
    console.warn(`[SFTP] Suppression locale impossible (${filePath}) :`, e);
  }
};

const deleteSftpFile = async (
  sftpClient: sftp,
  dataDirectory: string,
  xmlFileName: string
): Promise<void> => {
  try {
    await sftpClient.delete(`uploads/RA01Maestro/data/${xmlFileName}`);
  } catch (e) {
    console.error(`[SFTP] Échec de la suppression de ${xmlFileName} :`, e);
  }
  await safeUnlink(path.join(dataDirectory, xmlFileName));
};

const notify = async (
  response: RaiResponse,
  zipFile: string
): Promise<void> => {
  switch (response.state) {
    case 'PROCESSED':
      break;
    case 'REJECTED':
      await mattermostService.send(
        `[Maestro] RAI rejetée (faute labo) (file=${zipFile}, motif=${response.message})`
      );
      break;
    case 'INTERNAL_ERROR':
      await mattermostService.send(
        `[Maestro] Erreur RAI EDI interne (file=${zipFile}) : ${response.message}`
      );
      break;
    default:
      assertUnreachable(response.state);
  }
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
    const files = await readdir(dataDirectory);

    for (const xmlFileName of files) {
      if (!xmlFileName.endsWith('.xml')) {
        console.warn(`Le fichier ${xmlFileName} n'est pas un XML`);
        continue;
      }

      const receivedAt = new Date();
      try {
        const content = readFileSync(path.join(dataDirectory, xmlFileName));
        const xmlFile = new File([new Uint8Array(content)], xmlFileName, {
          type: 'application/xml'
        });
        const xmlDocumentId = await documentService.insertDocument(
          xmlFile,
          'RaiSourceFile',
          null
        );
        const response = await processSachaContent(
          content,
          xmlDocumentId,
          sachaConf,
          xmlFileName
        );
        const raiId = await analysisRaiRepository.insert({
          source: 'SFTP',
          edi: true,
          analysisId: response.analysisId,
          laboratoryId: response.laboratoryId,
          receivedAt,
          state: response.state,
          payload: null,
          message: response.message
        });
        await analysisRaiRepository.linkDocuments(raiId, [xmlDocumentId]);
        await deleteSftpFile(sftpClient, dataDirectory, xmlFileName);
        await notify(response, xmlFileName);
      } catch (e: any) {
        console.error(`[SFTP] Erreur sur ${xmlFileName} :`, e.message);
        await mattermostService.send(
          `[Maestro] Erreur RAI EDI interne (file=${xmlFileName}) : ${e.message}`
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
