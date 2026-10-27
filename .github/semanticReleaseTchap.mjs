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

const escapeHtml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const formatInline = (text) =>
  escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const markdownToHtml = (markdown) => {
  const html = [];
  let inList = false;

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^(#{1,6}) (.*)$/);
    const listItem = line.match(/^[*-] (.*)$/);

    if (inList && !listItem) {
      html.push('</ul>');
      inList = false;
    }

    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
    } else if (listItem) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${formatInline(listItem[1])}</li>`);
    } else if (line.trim() !== '') {
      html.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inList) {
    html.push('</ul>');
  }

  return html.join('');
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
        body: JSON.stringify({
          msgtype: 'm.text',
          body: message,
          format: 'org.matrix.custom.html',
          formatted_body: markdownToHtml(message)
        }),
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
