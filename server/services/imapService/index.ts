import { ImapFlow } from 'imapflow';
import { isNull } from 'lodash';
import { ParsedMail, simpleParser } from 'mailparser';
import { LaboratoryName } from '../../../shared/referential/Laboratory';
import { Analyte } from '../../../shared/referential/Residue/Analyte';
import { ComplexResidue } from '../../../shared/referential/Residue/ComplexResidue';
import { SimpleResidue } from '../../../shared/referential/Residue/SimpleResidue';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { initKysely, kysely } from '../../repositories/kysely';
import config from '../../utils/config';
import { getUploadSignedUrlS3 } from '../s3Service';
import { girpaConf } from './girpa';

const laboratoriesWithConf = ['GIR 49'] as const satisfies LaboratoryName[];
type LaboratoryWithConf = (typeof laboratoriesWithConf)[number];

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export type ExportResidue =
  | { value: SimpleResidue; kind: 'SimpleResidue' }
  | { value: ComplexResidue; kind: 'ComplexResidue' }
  | { value: Analyte; kind: 'Analyte' };

export type ExportDataSubstance = { substance: ExportResidue } & (
  | { result_kind: 'NQ'; result: null; lmr: null }
  | {
      result_kind: 'Q';
      result: number;
      lmr: number;
    }
);
export type IsSender = (senderAddress: string) => boolean;
export type ExportSample = {
  sampleReference: Sample['reference'];
  notes: string;
  pdfFile: File;
  substances: ExportDataSubstance[];
};
export type ExportDataFromEmail = (email: ParsedMail) => ExportSample[];

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

//FIXME pas d'emails
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
        const messageUid: string = `${message.messageUid}`;
        //undefined permet de récupérer tout l'email
        const downloadObject = await client.download(messageUid, undefined, {
          uid: true
        });

        const parsed = await simpleParser(downloadObject.content);

        //FIXME trash
        // await client.messageMove(messageUid, config.inbox.trashboxName, {uid: true})

        try {
          const data =
            laboratoriesConf[message.laboratoryName].exportDataFromEmail(
              parsed
            );

          initKysely(config.databaseUrl);
          for (const analyse of data) {
            const { url, documentId } = await getUploadSignedUrlS3(
              analyse.pdfFile.name
            );

            const uploadResult = await fetch(url, {
              method: 'PUT',
              body: analyse.pdfFile
            });
            if (!uploadResult.ok) {
              //FIXME
              // return {
              //   error: {
              //     status: uploadResult.status,
              //     data: await uploadResult.json(),
              //   } as FetchBaseQueryError,
              // };
            }
            await kysely.transaction().execute(async (trx) => {
              await trx
                .insertInto('documents')
                .values({
                  id: documentId,
                  filename: analyse.pdfFile.name,
                  kind: 'AnalysisReportDocument',
                  createdAt: new Date(),
                  createdBy: null
                })
                .execute();
            });
            console.log(JSON.stringify(data, null, 4));
            // createWriteStream(parsed.attachments[2].filename ?? '').write(parsed.attachments[2].content)
          }
        } catch (e: any) {
          console.error(
            `Email "${parsed.subject}" from "${parsed.from?.value[0].address}" ignoré => `,
            e.message
          );
          //FIXME envoyer une notification (mattermost ? email ?) aux devs
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

run().catch((err) => console.error(err));
