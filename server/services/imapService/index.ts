import { ImapFlow } from 'imapflow';
import { isNull } from 'lodash';
import { ParsedMail, simpleParser } from 'mailparser';
import { LaboratoryName } from '../../../shared/referential/Laboratory';
import { Analyte } from '../../../shared/referential/Residue/Analyte';
import { ComplexResidue } from '../../../shared/referential/Residue/ComplexResidue';
import { SimpleResidue } from '../../../shared/referential/Residue/SimpleResidue';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { kysely } from '../../repositories/kysely';
import { AnalysisResidues, ResidueAnalytes } from '../../repositories/kysely.type';
import config from '../../utils/config';
import { deleteDocumentS3, getUploadSignedUrlS3 } from '../s3Service';
import { girpaConf } from './girpa';
import { ComplexResidueAnalytes } from '../../../shared/referential/Residue/ComplexResidueAnalytes';

const laboratoriesWithConf = ['GIR 49'] as const satisfies LaboratoryName[];
type LaboratoryWithConf = (typeof laboratoriesWithConf)[number];

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export type ExportResidueAnalyte =  { reference: Analyte; kind: 'Analyte' };
export type ExportResidue =
  | { reference: SimpleResidue; kind: 'SimpleResidue' }
  | { reference: ComplexResidue; kind: 'ComplexResidue' }
  | ExportResidueAnalyte;

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
// from https://stackoverflow.com/questions/72789915/typescript-omit-seems-to-transform-an-union-into-an-intersection/72790170#72790170
export type OmitDistributive<T, K extends string> = T extends unknown ? Omit<T, K> : never

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


          try {
            const data =
              laboratoriesConf[message.laboratoryName].exportDataFromEmail(
                parsed
              );

            for (const analyse of data) {
              const analyseResidue: (Pick<
                AnalysisResidues,
                'result' | 'lmr' | 'resultKind' | 'residueNumber'
              > & {substance: ExportDataSubstance['substance']})[] = [];

              analyse.substances
                .filter((s) => s.substance.kind === 'SimpleResidue' || s.substance.kind === 'ComplexResidue')
                .forEach((s, index) => {
                  analyseResidue.push({
                    substance: s.substance,
                    result: s.result,
                    resultKind: s.result_kind,
                    lmr: s.lmr,
                    residueNumber: index + 1
                  });
                });

              const residueAnalytes : Pick<ResidueAnalytes, 'residueNumber' | 'result' | 'resultKind' | 'analyteNumber' | 'reference'>[] = []
              const analytes = analyse.substances.filter((s): s is (OmitDistributive<ExportDataSubstance, 'substance'> & {substance: ExportResidueAnalyte}) => s.substance.kind === 'Analyte')

              for (let i = 0; i < analytes.length; i++){
                const analyte = analytes[i];
                const complexResidue = analyseResidue.find(aR => aR.substance.kind === 'ComplexResidue' && ComplexResidueAnalytes[aR.substance.reference].includes(analyte.substance.reference))
                if (complexResidue === undefined) {
                  throw new ExtractError(`Impossible de trouver le résidu complexe pour l'analyte ${analyte.substance.reference}`)
                }

                residueAnalytes.push({
                  reference: analyte.substance.reference,
                 residueNumber: complexResidue.residueNumber,
                 analyteNumber: i + 1,
                  resultKind: analyte.result_kind,
                  result: analyte.result
                })
              }

              const { sampleId, analyseId } = await kysely
                .selectFrom('samples')
                .leftJoin('analysis', 'samples.id', 'analysis.sampleId')
                .where('reference', '=', analyse.sampleReference)
                .select(['samples.id as sampleId', 'analysis.id as analyseId'])
                .executeTakeFirstOrThrow();

              if (analyseId !== null) {
                throw new ExtractError(
                  `Une analyse est déjà présente pour cet échantillon : ${analyse.sampleReference}`
                );
              }

              const { url, documentId } = await getUploadSignedUrlS3(
                analyse.pdfFile.name
              );

              const uploadResult = await fetch(url, {
                method: 'PUT',
                body: analyse.pdfFile
              });
              if (!uploadResult.ok) {
                throw new ExtractError(
                  `Impossible d'uploader le PDF sur le S3: HTTP ${uploadResult.status}`
                );
              }
              try{
              await kysely
                .transaction()
                .execute(async (trx) => {
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

                  //FIXME trop de colonnes nullable
                  const { analysisId } = await trx
                    .insertInto('analysis')
                    .values({
                      sampleId,
                      reportDocumentId: documentId,
                      //FIXME faut mettre quel status ?
                      status: 'Completed',
                      createdBy: null,
                      createdAt: new Date(),
                      //FIXME ou pas
                      compliance: true,
                      notesOnCompliance: analyse.notes,
                      //FIXME ou pas ? Ça ne devrait pas être demandé dans la DAI ?
                      kind: 'Mono'
                    })
                    .returning('analysis.id as analysisId')
                    .executeTakeFirstOrThrow();

                  //FIXME trop de colonnes nullable
                  await trx.insertInto('analysisResidues').values(
                    analyseResidue.map((a) => {

                      const reference = a.substance.reference
                      const { substance, ...rest} = a
                      return {
                        ...rest,
                        reference,
                        analysisId
                      };
                    })
                  ).executeTakeFirstOrThrow();

                  //FIXME apparemment faut mettre à jour le statut du sample, on ne peut pas mieux faire ?


                  await trx.insertInto('residueAnalytes').values(
                    residueAnalytes.map(r => ({...r, analysisId}))
                  ).executeTakeFirstOrThrow()
                })
            }catch(e){
                  //Supprime le document du S3 si la transaction a échouée
                  await deleteDocumentS3(documentId, analyse.pdfFile.name);
                  throw e;
                }
                
            }
          } catch (e: any) {
            console.error(
              `Email "${parsed.subject}" from "${parsed.from?.value[0].address}" ignoré => `,
              e.message
            );
            //FIXME envoyer une notification (mattermost ? email ?) aux devs
          }

          //FIXME trash pour ceux traités, sinon prévoir un répertoire pour ceux en erreur
          // await client.messageMove(messageUid, config.inbox.trashboxName, {uid: true})



          //FIXME si traité, on envoie une notification au préleveur ?!
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
