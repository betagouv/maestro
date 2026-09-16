import path from 'node:path';
import type { Readable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { Department } from 'maestro-shared/referential/Department';
import type {
  AnalysisRai,
  AnalysisRaiId,
  AnalysisRaiState
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import sftp from 'ssh2-sftp-client';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import type { SachaConf } from '../../repositories/kysely.type';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import config from '../../utils/config';
import { documentService } from '../documentService';
import { tchapService } from '../tchapService';
import { unzip } from '../zipService';
import { RaiLabError } from './sachaErrors';
import {
  assertSachaLaboratory,
  depositSachaFiles,
  queueSachaAcknowledgement
} from './sachaOutgoingFileService';
import { processSachaRAI } from './sachaRAI';
import { generateXMLAcquitement, type XmlFile } from './sachaToXML';
import type { SachaResultats } from './sachaValidator';
import { resultatsMessageValidator, toSachaDateTime } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

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
  acknowledgement: {
    xmlFile: XmlFile;
    laboratory: LaboratoryWithSacha;
  } | null;
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
        assertSachaLaboratory(laboratory);
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
        return {
          state: 'PROCESSED',
          analysisId: outcome.analysisId,
          laboratoryId: outcome.laboratoryId,
          message: null,
          acknowledgement: { xmlFile: xml, laboratory }
        };
      } catch (e) {
        return {
          state: 'INTERNAL_ERROR',
          analysisId: outcome.analysisId,
          laboratoryId: outcome.laboratoryId,
          message: errorMessage(e),
          acknowledgement: null
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
          message: `Non-acquittement non adressable (émetteur=${envelope.senderSigle}, destinataire=${envelope.recipientSigle}) : ${outcome.motif}`,
          acknowledgement: null
        };
      }
      try {
        assertSachaLaboratory(laboratory);
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
        return {
          state: 'REJECTED',
          analysisId: null,
          laboratoryId: laboratory.id,
          message: outcome.motif,
          acknowledgement: { xmlFile: xml, laboratory }
        };
      } catch (e) {
        return {
          state: 'INTERNAL_ERROR',
          analysisId: null,
          laboratoryId: laboratory.id,
          message: errorMessage(e),
          acknowledgement: null
        };
      }
    }
    case 'INTERNAL_ERROR':
      return {
        state: 'INTERNAL_ERROR',
        analysisId: null,
        laboratoryId: outcome.laboratoryId,
        message: outcome.message,
        acknowledgement: null
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
      message: decoded.message,
      acknowledgement: null
    };
  }
  const outcome: RaiOutcome =
    decoded.kind === 'valid'
      ? await processResultats(decoded.resultats, xmlDocumentId)
      : { kind: 'NACK', motif: `fichier invalide : ${decoded.detail}` };
  return respond(decoded.envelope, outcome, sachaConf);
};

const queueAcknowledgement = async (
  raiId: AnalysisRaiId,
  response: RaiResponse
): Promise<RaiResponse> => {
  if (response.acknowledgement === null) {
    return response;
  }
  try {
    await queueSachaAcknowledgement(
      response.acknowledgement.xmlFile,
      response.acknowledgement.laboratory,
      raiId
    );
    return response;
  } catch (e) {
    const failed: RaiResponse = {
      ...response,
      state: 'INTERNAL_ERROR',
      message: errorMessage(e)
    };
    await analysisRaiRepository.update(raiId, {
      state: failed.state,
      message: failed.message
    });
    return failed;
  }
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
  const content = await buffer(doc.file as Readable);

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
  await queueAcknowledgement(rai.id, response);
};

const notify = async (
  response: RaiResponse,
  fileName: string
): Promise<void> => {
  switch (response.state) {
    case 'PROCESSED':
      break;
    case 'REJECTED':
      await tchapService.send(
        `[Maestro] RAI rejetée (faute labo) (file=${fileName}, motif=${response.message})`
      );
      break;
    case 'INTERNAL_ERROR':
      await tchapService.send(
        `[Maestro] Erreur RAI EDI interne (file=${fileName}) : ${response.message}`
      );
      break;
    default:
      assertUnreachable(response.state);
  }
};

const processRaiFile = async (
  xmlFileName: string,
  content: Buffer,
  sachaConf: SachaConf
): Promise<void> => {
  const receivedAt = new Date();
  try {
    const xmlDocumentId = await documentService.insertDocument(
      new File([new Uint8Array(content)], xmlFileName, {
        type: 'application/xml'
      }),
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
    await notify(await queueAcknowledgement(raiId, response), xmlFileName);
  } catch (e) {
    console.error(`[SFTP] Erreur sur ${xmlFileName} :`, errorMessage(e));
    await tchapService.send(
      `[Maestro] Erreur RAI EDI interne (file=${xmlFileName}) : ${errorMessage(e)}`
    );
  }
};

const SFTP_RAI_DIR = 'uploads/Labo-Sigal-Maestro/RA01';

const readRaiArchives = async (
  sftpClient: Pick<sftp, 'list' | 'get' | 'delete'>
): Promise<void> => {
  const fileNames = new Set(
    (await sftpClient.list(SFTP_RAI_DIR)).map((file) => file.name)
  );
  const zipNames = [...fileNames].filter((name) => name.endsWith('.zip'));
  if (zipNames.length === 0) {
    return;
  }

  const sachaConf = await sachaConfRepository.get();

  for (const zipName of zipNames) {
    const triggerName = `Decl_${path.basename(zipName, '.zip')}`;
    if (!fileNames.has(triggerName)) {
      console.info(`[SFTP] ${zipName} sans déclencheur, ignoré`);
      continue;
    }

    let archive: Buffer;
    try {
      archive = (await sftpClient.get(`${SFTP_RAI_DIR}/${zipName}`)) as Buffer;
      await documentService.insertDocument(
        new File([new Uint8Array(archive)], zipName, {
          type: 'application/zip'
        }),
        'RaiSourceFile',
        null
      );
      await sftpClient.delete(`${SFTP_RAI_DIR}/${zipName}`);
      await sftpClient.delete(`${SFTP_RAI_DIR}/${triggerName}`);
    } catch (e) {
      console.error(`[SFTP] Erreur sur ${zipName} :`, errorMessage(e));
      await tchapService.send(
        `[Maestro] Erreur RAI EDI interne (file=${zipName}) : ${errorMessage(e)}`
      );
      continue;
    }

    let entries: Record<string, Uint8Array>;
    try {
      entries = unzip(new Uint8Array(archive));
    } catch (e) {
      await tchapService.send(
        `[Maestro] Erreur RAI EDI interne (file=${zipName}) : archive illisible : ${errorMessage(e)}`
      );
      continue;
    }

    for (const [entryPath, content] of Object.entries(entries)) {
      if (entryPath.endsWith('/')) {
        continue;
      }
      if (!entryPath.endsWith('.xml')) {
        console.warn(`[SFTP] ${zipName} : ${entryPath} n'est pas un XML`);
        continue;
      }
      await processRaiFile(
        path.basename(entryPath),
        Buffer.from(content),
        sachaConf
      );
    }
  }
};

export const exchangeWithSachaSftp = async (): Promise<void> => {
  if (
    !config.sigal.sftp.privateKey ||
    !config.sigal.sftp.passphrase ||
    !config.sigal.sftp.host ||
    !config.sigal.sftp.username
  ) {
    console.warn(
      "La configuration de SFTP est incomplète. L'échange avec le SFTP SACHA est donc désactivé."
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
  } catch (e) {
    console.error(errorMessage(e));
    await tchapService.send(
      '[Maestro] Erreur EDI SACHA, impossible de se connecter au SFTP'
    );
    return;
  }

  try {
    await readRaiArchives(sftpClient);
    await depositSachaFiles(sftpClient, Date.now());
  } catch (e) {
    console.error(errorMessage(e));
    await tchapService.send(
      `[Maestro] Erreur lors de l'échange avec le SFTP SACHA : ${errorMessage(e)}`
    );
  } finally {
    await sftpClient.end();
  }
};
