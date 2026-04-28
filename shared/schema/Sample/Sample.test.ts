import { describe, expect, test } from 'vitest';
import { toMaestroDate } from '../../utils/date';
import { checkSchema } from '../../utils/zod';
import { SampleBase, sampleSendCheck } from './Sample';

const schema = checkSchema(
  SampleBase.pick({
    sampledDate: true,
    sentAt: true,
    specificData: true
  }),
  sampleSendCheck
);

describe('sampleSendCheck', () => {
  test('accepte sampledDate et sentAt le même jour en heure de Paris', () => {
    const sentAt = new Date();
    const result = schema.safeParse({
      sampledDate: toMaestroDate(sentAt),
      sentAt,
      specificData: {}
    });

    expect(result.success).toBe(true);
  });

  test('refuse une sampledDate strictement postérieure à sentAt', () => {
    const sentAt = new Date('2026-04-28T10:00:00Z');
    const result = schema.safeParse({
      sampledDate: '2026-04-29',
      sentAt,
      specificData: {}
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['sampledDate'],
        message:
          "La date de prélèvement ne peut pas être postérieure à la date d'envoi au laboratoire."
      })
    );
  });

  test('accepte sampledDate du jour quand sentAt est en soirée UTC mais déjà au lendemain à Paris', () => {
    // 2026-04-28 22:30 UTC === 2026-04-29 00:30 Europe/Paris
    const sentAt = new Date('2026-04-28T22:30:00Z');
    const sampledDate = toMaestroDate(sentAt);

    expect(sampledDate).toBe('2026-04-29');

    const result = schema.safeParse({
      sampledDate,
      sentAt,
      specificData: {}
    });

    expect(result.success).toBe(true);
  });
});
