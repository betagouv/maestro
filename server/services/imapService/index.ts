import { ImapFlow } from 'imapflow';
import { isNil } from 'lodash-es';
import { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import {
  getSSD2Id,
  SSD2Referential
} from 'maestro-shared/referential/Residue/SSD2Referential';
import { SandreToSSD2 } from 'maestro-shared/referential/Residue/SandreToSSD2';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { MaestroDate } from 'maestro-shared/utils/date';
import {
  getRecordKeys,
  OmitDistributive
} from 'maestro-shared/utils/typescript';
import { Attachment, ParsedMail, simpleParser } from 'mailparser';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import { laboratoryResidueMappingRepository } from '../../repositories/laboratoryResidueMappingRepository';
import config from '../../utils/config';
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

const getLaboratoryNameBySender = async (
  senderAddress: string
): Promise<null | LaboratoryWithConf> => {
  const laboratory = await laboratoryRepository.findByEmailSender(
    senderAddress.toLowerCase()
  );

  const laboratoryShortName = laboratory?.shortName;

  if (
    laboratoryShortName !== undefined &&
    laboratoryShortName in laboratoriesConf
  ) {
    return laboratoryShortName as LaboratoryWithConf;
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
          if (!message.envelope || !message.envelope.sender) {
            throw new ExtractError("Impossible d'ouvrir l'email");
          }
          console.log(
            'Email reçu',
            message.envelope.sender[0].address,
            message.envelope.subject
          );

          const laboratoryName: LaboratoryWithConf | null =
            await getLaboratoryNameBySender(
              message.envelope.sender[0].address ?? ''
            );

          if (laboratoryName !== null) {
            if (!messagesByLaboratory[laboratoryName]) {
              messagesByLaboratory[laboratoryName] = [];
            }
            messagesByLaboratory[laboratoryName].push(message.uid);
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
            parsedEmails.push({ ...parsed, messageUid: `${messageUid}` });
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
            try {
              const analyzes = await laboratoriesConf[
                laboratoryName
              ].exportDataFromEmail(emails.flatMap((p) => p.attachments));

              if (analyzes.length === 0) {
                throw new ExtractError(
                  "Aucun résultat d'analyses trouvé dans cet email."
                );
              }

              for (const analysis of analyzes) {
                const residues: (ExportDataSubstance & {
                  ssd2Id: SSD2Id | null;
                })[] = analysis.residues.map((r) => {
                  return {
                    ...r,
                    ssd2Id: ssd2IdByLabel[r.label] ?? null
                  };
                });

                //On créer une liste de warnings avec les résidus introuvables dans SSD2
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
                      const potentialSSD2Id = getSSD2Id(
                        r.label,
                        r.codeSandre,
                        r.casNumber
                      );
                      warnings.add(
                        `Impossible d'identifier le résidu : ${r.label} ${potentialSSD2Id !== null ? 'ssd2Id potentiel:' + potentialSSD2Id : ''}`
                      );
                    }
                  }
                });

                //On garde que les résidus intéressants
                const interestingResidues = residues
                  .filter((r) => r.result_kind !== 'ND')
                  .filter((r) => {
                    const ssd2Id = r.ssd2Id;

                    if (ssd2Id === null) {
                      return true;
                    }
                    const reference =
                      SSD2Referential[ssd2Id as keyof typeof SSD2Referential];
                    return (
                      !('deprecated' in reference) || !reference.deprecated
                    );
                  });

                //Erreur si un résidu intéressant n'a pas de SSD2Id
                interestingResidues.forEach((r) => {
                  if (r.ssd2Id === null) {
                    if (
                      ssd2IdByLabel[r.label] === null &&
                      r.result_kind === 'ND'
                    ) {
                      warnings.add(
                        `Attention un résidu inconnu a été détecté, il a été ignoré : ${r.label}`
                      );
                    } else {
                      throw new ExtractError(
                        `Résidu non identifiable : ${r.label}`
                      );
                    }
                  }
                });

                const emailReceivedAt = new Date(
                  Math.max(
                    ...emails.map((e) => (e.date ?? new Date()).getTime())
                  )
                );
                const { sampleId, samplerId, samplerEmail } =
                  await analysisHandler(
                    {
                      ...analysis,
                      residues: residues.map(
                        ({ casNumber, codeSandre, label, ...rest }) => {
                          const unknownLabel =
                            rest.ssd2Id === null ? label : null;
                          return { ...rest, unknownLabel };
                        }
                      )
                    },
                    emailReceivedAt
                  );

                await notificationService.sendNotification(
                  {
                    category: 'AnalysisReviewTodo',
                    link: AppRouteLinks.SampleRoute.link(sampleId)
                  },
                  [{ id: samplerId, email: samplerEmail }],
                  undefined
                );
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
