import { ImapFlow } from 'imapflow';
import { isNull } from 'lodash';
import { ParsedMail, simpleParser } from 'mailparser';
import { LaboratoryName } from '../../../shared/referential/Laboratory';
import config from '../../utils/config';
import { girpaConf } from './girpa';

const laboratoriesWithConf = ['GIR 49'] as const satisfies LaboratoryName[];
type LaboratoryWithConf = (typeof laboratoriesWithConf)[number];

export type IsSender = (senderAddress: string) => boolean
export type ExportDataFromEmail = (email: ParsedMail) => unknown

export type LaboratoryConf = {
  isSender: IsSender;
  exportDataFromEmail: ExportDataFromEmail;
};
const laboratoriesConf = {
  'GIR 49': girpaConf
} as const satisfies {
  [name in LaboratoryWithConf]: {
    isSender: IsSender;
    exportDataFromEmail: ExportDataFromEmail;
  };
};

//FIXME test
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

const run = async () => {
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
      const messagesToRead: {
        messageUid: number;
        laboratoryName: LaboratoryWithConf;
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
          getLaboratoryNameBySender(message.envelope.sender[0].address ?? '');

        if (laboratoryName !== null) {
          messagesToRead.push({ messageUid: message.uid, laboratoryName });
          console.log('   =====>  ', laboratoryName);
        } else {
          console.log('   =====>  IGNORÉ');
        }
      }
      for (const message of messagesToRead) {
        const messageUid: string = `${message.messageUid}`
        //undefined permet de récupérer tout l'email
        const downloadObject = await client.download(messageUid, undefined, {
          uid: true
        });

        const parsed = await simpleParser(downloadObject.content);
        console.log(parsed);

        //FIXME trash
        // await client.messageMove(messageUid, config.inbox.trashboxName, {uid: true})

        const data =  laboratoriesConf[message.laboratoryName].exportDataFromEmail(
            parsed
          );

        console.log(data)
        // createWriteStream(parsed.attachments[2].filename ?? '').write(parsed.attachments[2].content)
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

run().catch((err) => console.error(err));
