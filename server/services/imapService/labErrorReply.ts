import { Brand } from 'maestro-shared/constants';
import config from '../../utils/config';
import createNodemailerService from '../mailService/nodemailerService';
import { mattermostService } from '../mattermostService';
import type { LaboratoryConf } from './index';

const replySubject = (subject: string): string =>
  /^re\s*:/i.test(subject) ? subject : `Re: ${subject}`;

const replyBody = (
  errorMessage: string,
  filenames: string[]
): string => `Bonjour,

Le rapport d'analyse que vous nous avez transmis n'a pas pu être intégré dans ${Brand}.

Motif : ${errorMessage}
${filenames.length > 0 ? `\nFichier(s) concerné(s) : ${filenames.join(', ')}\n` : ''}
Merci de corriger le rapport puis de le renvoyer en réponse à ce message.

Ce message est automatique.`;

export const sendLabErrorReply = async ({
  laboratoryConf,
  senderAddress,
  subject,
  messageId,
  filenames,
  errorMessage
}: {
  laboratoryConf: LaboratoryConf;
  senderAddress: string | undefined;
  subject: string;
  messageId: string | undefined;
  filenames: string[];
  errorMessage: string;
}): Promise<boolean> => {
  if (laboratoryConf.autoReplyOnLabError !== true || !senderAddress) {
    return false;
  }

  if (!messageId || !config.mailer.host) {
    console.warn(
      `Réponse au laboratoire impossible (messageId: ${messageId}, host SMTP: ${config.mailer.host})`
    );
    return false;
  }

  try {
    await createNodemailerService().sendReply({
      to: senderAddress,
      bcc: config.mail.from,
      replyTo: config.inbox.user ?? undefined,
      subject: replySubject(subject),
      text: replyBody(errorMessage, filenames),
      inReplyTo: messageId
    });
    return true;
  } catch (e) {
    console.error("Échec de l'envoi de la réponse au laboratoire", e);
    await mattermostService.send(
      `[${Brand}] Impossible de répondre à ${senderAddress} au sujet de "${subject}" : ${e instanceof Error ? e.message : e}`
    );
    return false;
  }
};
