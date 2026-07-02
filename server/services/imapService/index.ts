import { ImapFlow } from 'imapflow';
import { isNil } from 'lodash-es';
import type { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import { SandreToSSD2 } from 'maestro-shared/referential/Residue/SandreToSSD2';
import type { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { getSSD2Id } from 'maestro-shared/referential/Residue/SSD2Referential';
import type { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import type { AnalysisRai } from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { MaestroDate } from 'maestro-shared/utils/date';
import {
  getRecordKeys,
  type OmitDistributive
} from 'maestro-shared/utils/typescript';
import { type Attachment, type ParsedMail, simpleParser } from 'mailparser';
import { analysisRaiRepository } from '../../repositories/analysisRaiRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { laboratoryResidueMappingRepository } from '../../repositories/laboratoryResidueMappingRepository';
import config from '../../utils/config';
import { documentService } from '../documentService';
import { mattermostService } from '../mattermostService';
import { notificationService } from '../notificationService';
import { analysisHandler } from './analysis-handler';
import { ExtractError } from './extractError';
import { capinovConf } from './laborartories/capinov';
import { cerecoConf } from './laborartories/cereco/cereco';
import { girpaConf } from './laborartories/girpa';
import { inovalysConf } from './laborartories/inovalys';

export type ExportResultQuantifiable = {
  result_kind: 'Q';
  result: number;
  lmr: number | null;
};
export type ExportResultNonQuantifiable = { result_kind: 'NQ' | 'ND' };
export type ExportDataSubstance = {
  label: string;
  casNumber: string | null;
  codeSandre: string | null;
  analysisMethod: AnalysisMethod;
  analysisDate: MaestroDate | null;
} & (ExportResultNonQuantifiable | ExportResultQuantifiable);
export type ExportDataSubstanceWithSSD2Id = OmitDistributive<
  ExportDataSubstance,
  'casNumber' | 'label' | 'codeSandre'
> & { ssd2Id: SSD2Id | null; unknownLabel: string | null };

export type ExportAnalysis = {
  sampleReference: SampleChecked['reference'];
  itemNumber: number;
  copyNumber: number;
  notes: string;
  pdfFile: File;
  residues: ExportDataSubstance[];
};
export type ExportDataFromEmail = (
  attachments: Pick<Attachment, 'content' | 'filename' | 'contentType'>[]
) => Promise<ExportAnalysis[]>;

export type LaboratoryConf = {
  exportDataFromEmail: ExportDataFromEmail;
  getAnalysisKey: (email: EmailWithMessageUid) => string;
  emailCountByAnalysis: number;
};

export type LaboratoryWithConf = (typeof LaboratoryWithAutomation)[number];
export const laboratoriesConf = {
  'GIR 49': girpaConf,
  'LDA 72': inovalysConf,
  'CAP 29': capinovConf,
  'CER 30': cerecoConf
} as const satisfies {
  [name in LaboratoryWithConf]: LaboratoryConf;
};

const getLaboratoryBySender = async (
  senderAddress: string
): Promise<{ id: string; shortName: LaboratoryWithConf } | null> => {
  const laboratory = await laboratoryRepository.findByEmailSender(
    senderAddress.toLowerCase()
  );

  if (laboratory && laboratory.shortName in laboratoriesConf) {
    return {
      id: laboratory.id,
      shortName: laboratory.shortName as LaboratoryWithConf
    };
  }

  return null;
};

const moveMessageToErrorbox = async (
  subject: string,
  senderAddress: string,
  message: string,
  messageUids: string[],
  client: ImapFlow
) => {
  const error = `Email "${subject}" from "${senderAddress}" ignoré => ${message} `;
  console.error(error);

  for (const messageUid of messageUids) {
    await client.messageMove(messageUid, config.inbox.errorboxName, {
      uid: true
    });
  }

  await mattermostService.send(error);
};

type EmailWithMessageUid = { messageUid: string } & Pick<
  ParsedMail,
  'subject' | 'attachments' | 'from' | 'date'
>;

type EmailRaiResult = {
  analysisId: string;
  sampleId: string;
  samplerId: string;
  samplerEmail: string;
  compliance: null | true;
  pdfDocumentId: string;
  copyNumber: number;
};

const processEmailRaiAttachments = async (
  laboratoryName: LaboratoryWithConf,
  laboratoryId: string | null,
  attachments: Pick<Attachment, 'content' | 'filename' | 'contentType'>[],
  receivedAt: Date
): Promise<{ results: EmailRaiResult[]; warnings: Set<string> }> => {
  const warnings = new Set<string>();
  const dbMappingsList =
    await laboratoryResidueMappingRepository.findByLaboratoryShortName(
      laboratoryName
    );
  const ssd2IdByLabel = dbMappingsList.reduce(
    (acc, mapping) => {
      acc[mapping.label] = mapping.ssd2Id;
      return acc;
    },
    {} as Record<string, SSD2Id | null>
  );

  const analyzes =
    await laboratoriesConf[laboratoryName].exportDataFromEmail(attachments);

  if (analyzes.length === 0) {
    throw new ExtractError("Aucun résultat d'analyses trouvé dans cet email.");
  }

  const results: EmailRaiResult[] = [];
  for (const analysis of analyzes) {
    const residues: (ExportDataSubstance & {
      ssd2Id: SSD2Id | null;
    })[] = analysis.residues.map((r) => ({
      ...r,
      ssd2Id: ssd2IdByLabel[r.label] ?? null
    }));

    residues.forEach((r) => {
      if (!Object.keys(ssd2IdByLabel).includes(r.label)) {
        if (r.codeSandre !== null) {
          if (SandreToSSD2[r.codeSandre] === undefined) {
            if (r.ssd2Id !== null) {
              warnings.add(
                `Nouveau code Sandre détecté : ${r.label} ${r.codeSandre} => ${r.ssd2Id}`
              );
            } else {
              warnings.add(
                `Nouveau code Sandre détecté : ${r.label} ${r.codeSandre}`
              );
            }
          }
        }
        if (r.ssd2Id === null) {
          const potentialSSD2Id = getSSD2Id(r.label, r.codeSandre, r.casNumber);
          warnings.add(
            `Impossible d'identifier le résidu : ${r.label} ${potentialSSD2Id !== null ? `ssd2Id potentiel:${potentialSSD2Id}` : ''}`
          );
        }
      }
    });

    const blockingLabels = new Set<string>();
    const registeredLabels = new Set<string>();
    for (const r of residues) {
      if (r.ssd2Id !== null) {
        continue;
      }
      if (
        laboratoryId !== null &&
        !Object.keys(ssd2IdByLabel).includes(r.label) &&
        !registeredLabels.has(r.label)
      ) {
        await laboratoryResidueMappingRepository.update({
          laboratoryId,
          label: r.label,
          ssd2Id: null
        });
        registeredLabels.add(r.label);
      }
      if (r.result_kind === 'ND') {
        warnings.add(
          `Attention un résidu inconnu a été détecté, il a été ignoré : ${r.label}`
        );
      } else {
        blockingLabels.add(r.label);
      }
    }

    if (blockingLabels.size > 0) {
      throw new ExtractError(
        `Résidu non identifiable : ${[...blockingLabels].join(', ')}`
      );
    }

    const {
      sampleId,
      samplerId,
      samplerEmail,
      compliance,
      analysisId,
      documentId: pdfDocumentId
    } = await analysisHandler(
      {
        ...analysis,
        residues: residues.map(({ casNumber, codeSandre, label, ...rest }) => {
          const unknownLabel = rest.ssd2Id === null ? label : null;
          return { ...rest, unknownLabel };
        })
      },
      receivedAt
    );

    results.push({
      analysisId,
      sampleId,
      samplerId,
      samplerEmail,
      compliance,
      pdfDocumentId,
      copyNumber: analysis.copyNumber
    });
  }

  return { results, warnings };
};

export const replayRai = async (
  rai: Extract<AnalysisRai, { source: 'EMAIL' }>
): Promise<void> => {
  const messageUids = rai.payload.emails.map((e) => e.messageUid);
  if (messageUids.length === 0) {
    throw new Error('Aucun messageUid dans le payload de la RAI.');
  }

  if (
    isNil(config.inbox.host) ||
    isNil(config.inbox.user) ||
    isNil(config.inbox.password)
  ) {
    throw new Error('Configuration IMAP manquante.');
  }

  const client = new ImapFlow({
    host: config.inbox.host,
    auth: { user: config.inbox.user, pass: config.inbox.password },
    port: config.inbox.port,
    secure: true,
    logger: false
  });
  await client.connect();
  const lock = await client.getMailboxLock(config.inbox.errorboxName);

  try {
    const emails: EmailWithMessageUid[] = [];
    for (const messageUid of messageUids) {
      const downloadObject = await client.download(messageUid, undefined, {
        uid: true
      });
      const parsed = await simpleParser(downloadObject.content);
      emails.push({ ...parsed, messageUid });
    }

    const senderAddress = emails[0].from?.value[0]?.address ?? '';
    const laboratory = await getLaboratoryBySender(senderAddress);
    if (!laboratory) {
      throw new Error(
        `Laboratoire non identifié pour l'expéditeur ${senderAddress}.`
      );
    }

    const { results } = await processEmailRaiAttachments(
      laboratory.shortName,
      laboratory.id,
      emails.flatMap((e) => e.attachments),
      rai.receivedAt
    );

    if (results.length === 0) {
      throw new Error("Le retraitement n'a produit aucune analyse.");
    }

    const [first, ...extras] = results;
    await analysisRaiRepository.update(rai.id, {
      state: 'PROCESSED',
      analysisId: first.analysisId,
      laboratoryId: laboratory.id,
      message: null
    });

    for (const extra of extras) {
      const newRaiId = await analysisRaiRepository.insert({
        source: 'EMAIL',
        edi: false,
        state: 'PROCESSED',
        analysisId: extra.analysisId,
        laboratoryId: laboratory.id,
        payload: rai.payload,
        message: null,
        receivedAt: rai.receivedAt
      });
      await analysisRaiRepository.linkDocuments(newRaiId, [
        extra.pdfDocumentId
      ]);
    }

    for (const messageUid of messageUids) {
      await client.messageMove(messageUid, config.inbox.successboxName, {
        uid: true
      });
    }
  } finally {
    lock.release();
    await client.logout();
  }
};

export const checkEmails = async () => {
  if (
    isNil(config.inbox.user) ||
    isNil(config.inbox.host) ||
    isNil(config.inbox.password)
  ) {
    console.warn(
      "Impossible d'accéder à la boite email car les variables INBOX ne sont pas définies"
    );
    return;
  }

  const client = new ImapFlow({
    host: config.inbox.host,
    auth: {
      user: config.inbox.user,
      pass: config.inbox.password
    },
    port: config.inbox.port,
    secure: true,
    logger: false
  });
  await client.connect();
  const lock = await client.getMailboxLock(config.inbox.mailboxName);

  try {
    if (typeof client.mailbox !== 'boolean') {
      if (client.mailbox.exists === 0) {
        console.log('Aucun email à traiter');
      } else {
        const messagesByLaboratory: Record<LaboratoryWithConf, number[]> =
          {} as Record<LaboratoryWithConf, number[]>;
        const laboratoryIdByName: Partial<Record<LaboratoryWithConf, string>> =
          {};

        const messagesInError: {
          messageUid: string;
          sender: string;
          subject: string;
          error: string;
        }[] = [];

        for await (const message of client.fetch('1:*', {
          envelope: true,
          bodyStructure: true
        })) {
          if (!message.envelope?.sender) {
            throw new ExtractError("Impossible d'ouvrir l'email");
          }
          console.log(
            'Email reçu',
            message.envelope.sender[0].address,
            message.envelope.subject
          );

          const laboratory = await getLaboratoryBySender(
            message.envelope.sender[0].address ?? ''
          );

          if (laboratory !== null) {
            const laboratoryName = laboratory.shortName;
            if (!messagesByLaboratory[laboratoryName]) {
              messagesByLaboratory[laboratoryName] = [];
            }
            messagesByLaboratory[laboratoryName].push(message.uid);
            laboratoryIdByName[laboratoryName] = laboratory.id;
            console.log('   =====>  ', laboratoryName);
          } else {
            messagesInError.push({
              messageUid: `${message.uid}`,
              sender: message.envelope.sender[0].address ?? '',
              error:
                "Impossible d'identifier le laboratoire émetteur de cet email",
              subject: message.envelope.subject ?? ''
            });
          }
        }
        for (const messageInError of messagesInError) {
          await moveMessageToErrorbox(
            messageInError.subject,
            messageInError.sender,
            messageInError.error,
            [messageInError.messageUid],
            client
          );
        }
        const warnings = new Set<string>();

        for (const laboratoryName of getRecordKeys(messagesByLaboratory)) {
          const parsedEmails: EmailWithMessageUid[] = [];
          for (const messageUid of messagesByLaboratory[laboratoryName]) {
            //undefined permet de récupérer tout l'email
            const downloadObject = await client.download(
              `${messageUid}`,
              undefined,
              {
                uid: true
              }
            );
            const parsed = await simpleParser(downloadObject.content);
            parsedEmails.push({
              ...parsed,
              messageUid: `${messageUid}`
            });
          }

          //certains laboratoires émettent plusieurs emails pour une analyse
          const emailsByAnalysis: Record<string, EmailWithMessageUid[]> =
            parsedEmails.reduce(
              (acc, email) => {
                const analysisKey =
                  laboratoriesConf[laboratoryName].getAnalysisKey(email);
                if (!acc[analysisKey]) {
                  acc[analysisKey] = [];
                }
                acc[analysisKey].push(email);
                return acc;
              },
              {} as Record<string, EmailWithMessageUid[]>
            );

          //on vérifie que pour chaque analyses, on a reçu tous les emails
          const emailsByAnalysisFull: Record<string, EmailWithMessageUid[]> =
            {};
          for (const emailsByAnalysisKey in emailsByAnalysis) {
            if (
              emailsByAnalysis[emailsByAnalysisKey].length ===
              laboratoriesConf[laboratoryName].emailCountByAnalysis
            ) {
              emailsByAnalysisFull[emailsByAnalysisKey] =
                emailsByAnalysis[emailsByAnalysisKey];
            }
          }

          for (const emails of Object.values(emailsByAnalysisFull)) {
            const receivedAt = new Date(
              Math.max(...emails.map((e) => (e.date ?? new Date()).getTime()))
            );
            const payload = {
              emails: emails.map((e) => ({
                messageUid: e.messageUid,
                subject: e.subject,
                from: e.from?.value[0]?.address,
                date: e.date
              }))
            };
            const laboratoryId = laboratoryIdByName[laboratoryName] ?? null;

            const uploadAttachmentsAsRaiSourceFiles = async (
              attachments: Attachment[]
            ): Promise<string[]> => {
              const ids: string[] = [];
              for (const att of attachments) {
                try {
                  const file = new File(
                    [new Uint8Array(att.content)],
                    att.filename ?? 'unknown',
                    { type: att.contentType }
                  );
                  ids.push(
                    await documentService.insertDocument(
                      file,
                      'RaiSourceFile',
                      null
                    )
                  );
                } catch (uploadError) {
                  console.error(
                    `Échec upload PJ ${att.filename ?? 'unknown'}`,
                    uploadError
                  );
                }
              }
              return ids;
            };

            try {
              const { results, warnings: extractionWarnings } =
                await processEmailRaiAttachments(
                  laboratoryName,
                  laboratoryId,
                  emails.flatMap((p) => p.attachments),
                  receivedAt
                );
              for (const w of extractionWarnings) {
                warnings.add(w);
              }

              const otherAttachments = emails
                .flatMap((e) => e.attachments)
                .filter((a) => !a.filename?.toLowerCase().endsWith('.pdf'));
              const otherDocumentIds =
                await uploadAttachmentsAsRaiSourceFiles(otherAttachments);

              for (const result of results) {
                const raiId = await analysisRaiRepository.insert({
                  source: 'EMAIL',
                  edi: false,
                  state: 'PROCESSED',
                  analysisId: result.analysisId,
                  laboratoryId,
                  payload,
                  message: null,
                  receivedAt
                });
                await analysisRaiRepository.linkDocuments(raiId, [
                  result.pdfDocumentId,
                  ...otherDocumentIds
                ]);

                //si exemplaire 2 ou plus, alors il faut envoyer dans tous les cas
                if (result.compliance === null || result.copyNumber !== 1) {
                  await notificationService.sendNotification(
                    {
                      category: 'AnalysisReviewTodo',
                      link: AppRouteLinks.SampleRoute.link(result.sampleId)
                    },
                    [{ id: result.samplerId, email: result.samplerEmail }],
                    undefined
                  );
                }
              }

              for (const message of emails) {
                await client.messageMove(
                  `${message.messageUid}`,
                  config.inbox.successboxName,
                  {
                    uid: true
                  }
                );
              }
            } catch (e: any) {
              console.error(e);
              const errorDocumentIds = await uploadAttachmentsAsRaiSourceFiles(
                emails.flatMap((email) => email.attachments)
              );
              const raiId = await analysisRaiRepository.insert({
                source: 'EMAIL',
                edi: false,
                state: 'ERROR',
                analysisId: null,
                laboratoryId,
                payload,
                message: e.message,
                receivedAt
              });
              await analysisRaiRepository.linkDocuments(
                raiId,
                errorDocumentIds
              );
              const parsed = emails[0];
              await moveMessageToErrorbox(
                parsed.subject ?? '',
                parsed.from?.value[0].address ?? '',
                e.message,
                emails.map((message) => message.messageUid),
                client
              );
            } finally {
              if (warnings.size > 0) {
                const warningMessage = Array.from(warnings).join('\n -');
                console.warn(warningMessage);
                await mattermostService.send(warningMessage);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    // Make sure lock is released, otherwise next `getMailboxLock()` never returns
    lock.release();
  }

  // log out and close connection
  await client.logout();
};
