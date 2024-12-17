import { isNull } from 'lodash-es';
import config from '../utils/config';

const send = async (message: string) => {
  if (!isNull(config.mattermostIncomingWebhook)) {
    await fetch(config.mattermostIncomingWebhook, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const mattermostService= {send}