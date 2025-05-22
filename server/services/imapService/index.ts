import { ImapFlow } from 'imapflow';
import { isNull } from 'lodash-es';
import { LaboratoryWithAutomation } from 'maestro-shared/referential/Laboratory';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { getSSD2Id } from 'maestro-shared/referential/Residue/SSD2Referential';
import { SandreToSSD2 } from 'maestro-shared/referential/Residue/SandreToSSD2';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { NotificationCategoryMessages } from 'maestro-shared/schema/Notification/NotificationCategory';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { OmitDistributive } from 'maestro-shared/utils/typescript';
import { ParsedMail, simpleParser } from 'mailparser';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import config from '../../utils/config';
import { mattermostService } from '../mattermostService';
import { notificationService } from '../notificationService';
import { analysisHandler } from './analysis-handler';
import { capinovConf } from './capinov';
import { ExtractError } from './extractError';
import { girpaConf } from './girpa';
import { inovalysConf } from './inovalys/inovalys';

export type ExportResultQuantifiable = {
  result_kind: 'Q';
  result: number;
  lmr: number;
};
export type ExportResultNonQuantifiable = { result_kind: 'NQ' | 'ND' };
export type ExportDataSubstance = {
  label: string;
  casNumber: string | null;
  codeSandre: string | null;
  analysisMethod: AnalysisMethod;
} & (ExportResultNonQuantifiable | ExportResultQuantifiable);
export type ExportDataSubstanceWithSSD2Id = OmitDistributive<
  ExportDataSubstance,
  'casNumber' | 'label' | 'codeSandre'
> & { ssd2Id: SSD2Id | null; unknown_label: string | null };

export type ExportAnalysis = {
  sampleReference: Sample['reference'];
  notes: string;
  pdfFile: File;
  residues: ExportDataSubstance[];
};
export type ExportDataFromEmail = (email: ParsedMail) => ExportAnalysis[];

export type LaboratoryConf = {
  exportDataFromEmail: ExportDataFromEmail;
  ssd2IdByLabel: Record<string, SSD2Id>;
  unknownReferences: string[];
};

export type LaboratoryWithConf = (typeof LaboratoryWithAutomation)[number];
export const laboratoriesConf = {
  'GIR 49': girpaConf,
  'LDA 72': inovalysConf,
  'CAP 29': capinovConf
} as const satisfies {
  [name in LaboratoryWithConf]: LaboratoryConf;
};

const getLaboratoryNameBySender = async (
  senderAddress: string
): Promise<null | LaboratoryWithConf> => {
  const laboratory = await laboratoryRepository.findByEmailSender(
    senderAddress.toLowerCase()
  );

  const laboratoryName = laboratory?.name;

  if (laboratoryName !== undefined && laboratoryName in laboratoriesConf) {
    return laboratoryName as LaboratoryWithConf;
  }

  return null;
};

const moveMessageToErrorbox = async (
  subject: string,
  senderAddress: string,
  message: string,
  messageUid: string,
  client: ImapFlow
) => {
  const error = `Email "${subject}" from "${senderAddress}" ignoré => ${message} `;
  console.error(error);

  await client.messageMove(messageUid, config.inbox.errorboxName, {
    uid: true
  });

  await mattermostService.send(error);
};

export const checkEmails = async () => {
  if (
    isNull(config.inbox.user) ||
    isNull(config.inbox.host) ||
    isNull(config.inbox.password)
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
        const messagesToRead: {
          messageUid: number;
          laboratoryName: LaboratoryWithConf;
        }[] = [];

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
            messagesToRead.push({ messageUid: message.uid, laboratoryName });
            console.log('   =====>  ', laboratoryName);
          } else {
            messagesInError.push({
              messageUid: `${message.uid}`,
              sender: message.envelope.sender[0].address ?? '',
              error:
                "Impossible d'identifier le laboratoire émetteur de cet email",
              subject: message.envelope.subject
            });
          }
        }
        for (const messageInError of messagesInError) {
          await moveMessageToErrorbox(
            messageInError.subject,
            messageInError.sender,
            messageInError.error,
            messageInError.messageUid,
            client
          );
        }
        const warnings = new Set<string>();
        for (const message of messagesToRead) {
          const messageUid: string = `${message.messageUid}`;
          //undefined permet de récupérer tout l'email
          const downloadObject = await client.download(messageUid, undefined, {
            uid: true
          });

          const parsed = await simpleParser(downloadObject.content);

          try {
            const analyzes =
              laboratoriesConf[message.laboratoryName].exportDataFromEmail(
                parsed
              );

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
                  ssd2Id:
                    laboratoriesConf[message.laboratoryName].ssd2IdByLabel[
                      r.label
                    ] ?? null
                };
              });

              //On créer une liste de warnings avec les résidues introuvables dans SSD2
              residues.forEach((r) => {
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
                if (
                  r.ssd2Id === null &&
                  !laboratoriesConf[
                    message.laboratoryName
                  ].unknownReferences.includes(r.label)
                ) {
                  const potentialSSD2Id = getSSD2Id(
                    r.label,
                    r.codeSandre,
                    r.casNumber
                  );
                  warnings.add(
                    `Impossible d'identifier le résidue : ${r.label} ${potentialSSD2Id !== null ? 'ssd2Id potentiel:' + potentialSSD2Id : ''}`
                  );
                }
              });

              //On garde que les résidues intéressants
              const interestingResidues = residues.filter(
                (r) => r.result_kind !== 'ND'
              );

              //Erreur si un résidue intéressant n'a pas de SSD2Id
              interestingResidues.forEach((r) => {
                if (r.ssd2Id === null) {
                  throw new ExtractError(
                    `Résidue non identifiable : ${r.label}`
                  );
                }
              });
              const { sampleId, samplerId, samplerEmail } =
                await analysisHandler({
                  ...analysis,
                  residues: residues.map(
                    ({ casNumber, codeSandre, label, ...rest }) => {
                      const unknown_label = rest.ssd2Id === null ? label : null;
                      return { ...rest, unknown_label };
                    }
                  )
                });

              await notificationService.sendNotification(
                {
                  category: 'AnalysisReviewTodo',
                  link: AppRouteLinks.SampleRoute.link(sampleId),
                  message: NotificationCategoryMessages['AnalysisReviewTodo']
                },
                [{ id: samplerId, email: samplerEmail }],
                undefined
              );
            }
            await client.messageMove(messageUid, config.inbox.successboxName, {
              uid: true
            });
          } catch (e: any) {
            console.error(e);
            await moveMessageToErrorbox(
              parsed.subject ?? '',
              parsed.from?.value[0].address ?? '',
              e.message,
              messageUid,
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
  } catch (e) {
    console.error(e);
  } finally {
    // Make sure lock is released, otherwise next `getMailboxLock()` never returns
    lock.release();
  }

  // log out and close connection
  await client.logout();
};
