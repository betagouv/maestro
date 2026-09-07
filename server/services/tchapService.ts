import { isNil } from 'lodash-es';
import config from '../utils/config';

const send = async (message: string) => {
  const { homeserverUrl, accessToken, roomId } = config.tchap;
  if (isNil(homeserverUrl) || isNil(accessToken) || isNil(roomId)) {
    return;
  }

  const transactionId = crypto.randomUUID();
  const url = `${homeserverUrl}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${transactionId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify({ msgtype: 'm.text', body: message }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error(
        `[Tchap] Échec de l'envoi (${response.status}) : ${await response.text()}`
      );
    }
  } catch (e) {
    console.error("[Tchap] Échec de l'envoi", e);
  }
};

export const tchapService = { send };
