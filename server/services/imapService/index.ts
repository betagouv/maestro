import { ImapFlow } from 'imapflow';
import { isNull } from 'lodash-es';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { ParsedMail, simpleParser } from 'mailparser';
import config from '../../utils/config';
import { mattermostService } from '../mattermostService';
import { analysisHandler } from './analysis-handler';
import { girpaConf } from './girpa';
import { inovalysConf } from './inovalys';
import { capinovConf } from './capinov';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';

const laboratoriesWithConf = ['GIRPA', 'INOVALYS', 'CAPINOV'] as const satisfies string[];
type LaboratoryWithConf = (typeof laboratoriesWithConf)[number];

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export type ExportResidue =
  | { reference: SSD2Id; kind: 'SimpleResidue' }
  | { reference: SSD2Id; kind: 'ComplexResidue', analytes: ({
    reference: SSD2Id,
  } & ({result_kind: 'NQ', result: null} | {result_kind: 'Q', result: number}))[] }

export type ExportDataSubstance = ExportResidue & (
  | { result_kind: 'NQ'; result: null; lmr: null }
  | {
      result_kind: 'Q';
      result: number;
      lmr: number;
    }
);
export type IsSender = (senderAddress: string) => boolean;
export type ExportAnalysis = {
  sampleReference: Sample['reference'];
  notes: string;
  pdfFile: File;
  residues: ExportDataSubstance[];
};
export type ExportDataFromEmail = (email: ParsedMail) => ExportAnalysis[];

export type LaboratoryConf = {
  isSender: IsSender;
  exportDataFromEmail: ExportDataFromEmail;
};
const laboratoriesConf = {
  'GIRPA': girpaConf,
  'INOVALYS': inovalysConf,
  'CAPINOV': capinovConf
} as const satisfies {
  [name in LaboratoryWithConf]: LaboratoryConf;
};

export const getLaboratoryNameBySender = (
  senderAddress: string
): null | LaboratoryWithConf => {
  for (const laboratory of laboratoriesWithConf) {
    if (laboratoriesConf[laboratory].isSender(senderAddress)) {
      return laboratory;
    }
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
          messageUid: string,
          sender: string,
          subject: string,
          error: string
        }[] = []
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
            getLaboratoryNameBySender(message.envelope.sender[0].address ?? '');

          if (laboratoryName !== null) {
            messagesToRead.push({ messageUid: message.uid, laboratoryName });
            console.log('   =====>  ', laboratoryName);
          } else {
            messagesInError.push({ messageUid: `${message.uid}`,  sender: message.envelope.sender[0].address ?? '', error: "Impossible d'identifier le laboratoire émetteur de cet email", subject: message.envelope.subject})
          }
        }
        for (const messageInError of messagesInError){
          await moveMessageToErrorbox(messageInError.subject, messageInError.sender, messageInError.error, messageInError.messageUid, client)
        }
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
              throw new ExtractError("Aucun résultat d'analyses trouvé dans cet email.")
            }

            for (const analysis of analyzes) {
              await analysisHandler(analysis);
            }
            await client.messageMove(messageUid, config.inbox.trashboxName, {
              uid: true
            });

            //TODO AUTO_LABO si traité, on envoie une notification au préleveur ?!
          } catch (e: any) {
            await moveMessageToErrorbox(
              parsed.subject ?? '',
              parsed.from?.value[0].address ?? '',
              e.message,
              messageUid,
              client
            );
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
