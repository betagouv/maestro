const requiredEnvNames = [
  'TCHAP_HOMESERVER_URL',
  'TCHAP_ACCESS_TOKEN',
  'TCHAP_ROOM_ID'
];

export const verifyConditions = (_pluginConfig, { env }) => {
  const missing = requiredEnvNames.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement Tchap manquantes : ${missing.join(', ')}`
    );
  }
};

export const success = async (_pluginConfig, { env, nextRelease, logger }) => {
  const homeserverUrl = env.TCHAP_HOMESERVER_URL;
  const roomId = encodeURIComponent(env.TCHAP_ROOM_ID);
  const transactionId = crypto.randomUUID();
  const message = `[Maestro] Version ${nextRelease.version} (${nextRelease.type}) publiée.\n\n${nextRelease.notes}`;

  try {
    const response = await fetch(
      `${homeserverUrl}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${transactionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ msgtype: 'm.text', body: message }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.TCHAP_ACCESS_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      logger.error(
        `Échec de l'envoi Tchap (${response.status}) : ${await response.text()}`
      );
      return;
    }

    logger.log('Notification Tchap envoyée.');
  } catch (e) {
    logger.error("Échec de l'envoi Tchap", e);
  }
};
