import { beforeEach, describe, expect, test, vi } from 'vitest';
import config from '../../utils/config.ts';
import createNodemailerService from '../mailService/nodemailerService';
import { mattermostService } from '../mattermostService';
import type { LaboratoryConf } from './index';
import { sendLabErrorReply } from './labErrorReply';

const sendReply = vi.fn();
vi.mock('../mailService/nodemailerService', () => ({
  default: vi.fn(() => ({ sendReply }))
}));
vi.mock('../mattermostService', () => ({
  mattermostService: { send: vi.fn() }
}));

const conf = (autoReplyOnLabError: boolean): LaboratoryConf => ({
  exportDataFromEmail: async () => [],
  getAnalysisKey: (email) => email.messageUid,
  emailCountByAnalysis: 1,
  autoReplyOnLabError
});

const params = {
  senderAddress: 'labo@example.org',
  subject: 'Rapport 3266',
  messageId: '<abc123@cereco.fr>',
  filenames: ['rapport 3266.xls', 'B26-R9047-3266.pdf'],
  errorMessage: "Date d'analyse invalide : 20266"
};

describe('sendLabErrorReply', () => {
  beforeEach(() => {
    sendReply.mockReset().mockResolvedValue(undefined);
    vi.mocked(mattermostService.send).mockReset();
    vi.mocked(createNodemailerService).mockClear();
    config.mailer.host = 'smtp-relay.example.org';
    config.inbox.user = 'rai@maestro.beta.gouv.fr';
  });

  test("n'envoie rien si le laboratoire n'a pas activé la réponse automatique", async () => {
    const sent = await sendLabErrorReply({
      ...params,
      laboratoryConf: conf(false)
    });

    expect(sent).toBe(false);
    expect(sendReply).not.toHaveBeenCalled();
  });

  test("n'envoie rien sans adresse d'expéditeur", async () => {
    const sent = await sendLabErrorReply({
      ...params,
      senderAddress: undefined,
      laboratoryConf: conf(true)
    });

    expect(sent).toBe(false);
    expect(sendReply).not.toHaveBeenCalled();
  });

  // Sans Message-Id la réponse ne se rattacherait à rien : on préfère ne rien envoyer
  test("n'envoie rien sans Message-Id d'origine", async () => {
    const sent = await sendLabErrorReply({
      ...params,
      messageId: undefined,
      laboratoryConf: conf(true)
    });

    expect(sent).toBe(false);
    expect(sendReply).not.toHaveBeenCalled();
  });

  test("n'envoie rien si le relais SMTP n'est pas configuré", async () => {
    config.mailer.host = null;

    const sent = await sendLabErrorReply({
      ...params,
      laboratoryConf: conf(true)
    });

    expect(sent).toBe(false);
    expect(sendReply).not.toHaveBeenCalled();
  });

  test("répond dans le fil de l'email d'origine", async () => {
    const sent = await sendLabErrorReply({
      ...params,
      laboratoryConf: conf(true)
    });

    expect(sent).toBe(true);
    expect(sendReply).toHaveBeenCalledWith({
      to: 'labo@example.org',
      bcc: config.mail.from,
      replyTo: 'rai@maestro.beta.gouv.fr',
      subject: 'Re: Rapport 3266',
      inReplyTo: '<abc123@cereco.fr>',
      text: expect.stringContaining("Date d'analyse invalide : 20266")
    });
  });

  test('rappelle les fichiers concernés', async () => {
    await sendLabErrorReply({ ...params, laboratoryConf: conf(true) });

    expect(sendReply.mock.calls[0][0].text).toContain(
      'rapport 3266.xls, B26-R9047-3266.pdf'
    );
  });

  test('ne double pas le préfixe Re: quand le sujet en a déjà un', async () => {
    await sendLabErrorReply({
      ...params,
      subject: 'RE: Rapport 3266',
      laboratoryConf: conf(true)
    });

    expect(sendReply.mock.calls[0][0].subject).toBe('RE: Rapport 3266');
  });

  // Un échec d'envoi ne doit jamais interrompre l'ingestion de l'email
  test("ne propage pas l'échec d'envoi et alerte en interne", async () => {
    sendReply.mockRejectedValue(new Error('SMTP down'));

    const sent = await sendLabErrorReply({
      ...params,
      laboratoryConf: conf(true)
    });

    expect(sent).toBe(false);
    expect(mattermostService.send).toHaveBeenCalledOnce();
  });
});
