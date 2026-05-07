import { constants } from 'node:http2';
import SendEmailError from 'maestro-shared/errors/sendEmailError';
import SyncContactError from 'maestro-shared/errors/syncContactError';
import { ProgrammingPlanKindBrevoListId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import config from '../../utils/config';
import {
  type MailService,
  type SendOptions,
  type TemplateName,
  Templates
} from './mailService';

const toListIds = (kinds: UserRefined['programmingPlanKinds']): number[] => [
  ...new Set(kinds.map((k) => ProgrammingPlanKindBrevoListId[k]))
];

const allListIds = (): number[] => [
  ...new Set(Object.values(ProgrammingPlanKindBrevoListId))
];

class BrevoService implements MailService {
  private readonly baseUrl = 'https://api.brevo.com/v3';
  private readonly apiKey: string;

  constructor() {
    if (!config.mailer.apiKey) {
      throw new Error('Provide an API key for Brevo');
    }
    this.apiKey = config.mailer.apiKey;
  }

  private get headers() {
    return {
      accept: 'application/json',
      'api-key': this.apiKey,
      'content-type': 'application/json'
    };
  }

  async send<T extends TemplateName>(options: SendOptions<T>): Promise<void> {
    console.debug(
      '[brevoService] send',
      options.templateName,
      options.recipients
    );
    if (options.recipients.length > 0) {
      const brevoUrl = `${this.baseUrl}/smtp/email`;
      const body = {
        ...options,
        templateId: Templates[options.templateName].id,
        to: options.recipients.map((recipient) => ({ email: recipient }))
      };

      const response = await fetch(brevoUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[brevoService] send failed', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          templateName: options.templateName,
          recipients: options.recipients
        });
        throw new SendEmailError();
      }
    }
  }

  async createContact(
    user: Pick<UserRefined, 'email' | 'name' | 'programmingPlanKinds'>
  ): Promise<void> {
    console.debug('[brevoService] createContact', user.email);
    const listIds = toListIds(user.programmingPlanKinds);
    const response = await fetch(`${this.baseUrl}/contacts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        email: user.email,
        attributes: {
          NOM: user.name ?? undefined
        },
        ...(listIds.length > 0 ? { listIds } : {})
      })
    });

    if (!response.ok) {
      throw new SyncContactError(user.email);
    }
  }

  async updateContact(
    user: Pick<UserRefined, 'email' | 'name' | 'programmingPlanKinds'>
  ): Promise<void> {
    console.debug('[brevoService] updateContact', user.email);
    const listIds = toListIds(user.programmingPlanKinds);
    const unlinkListIds = allListIds().filter((id) => !listIds.includes(id));

    const url = `${this.baseUrl}/contacts/${encodeURIComponent(user.email)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        attributes: { NOM: user.name ?? undefined },
        ...(listIds.length > 0 ? { listIds } : {}),
        ...(unlinkListIds.length > 0 ? { unlinkListIds } : {})
      })
    });

    if (response.status === constants.HTTP_STATUS_NOT_FOUND) {
      await this.createContact(user);
      return;
    }

    if (!response.ok) {
      throw new SyncContactError(user.email);
    }
  }

  async deleteContact(email: string): Promise<void> {
    console.debug('[brevoService] deleteContact', email);
    const url = `${this.baseUrl}/contacts/${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers
    });

    if (!response.ok) {
      throw new SyncContactError(email);
    }
  }
}

export default function createBrevoService(): MailService {
  return new BrevoService();
}
