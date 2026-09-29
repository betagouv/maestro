import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { ExtractBadFormatError } from './extractError';

const schema = z.object({
  Analyse: z.array(z.object({ Methode: z.string() }))
});

const messageOf = (input: unknown) => {
  const { error } = schema.safeParse(input);
  if (!error) {
    throw new Error('Une erreur de validation est attendue');
  }
  return new ExtractBadFormatError(error).message;
};

describe('ExtractBadFormatError', () => {
  test('une seule erreur', () => {
    expect(
      messageOf({ Analyse: [{ Methode: 'M1' }, { Methode: 2 }] })
    ).toMatchInlineSnapshot(`
      "✖ Invalid input: expected string, received number
        → at Analyse[1].Methode"
    `);
  });

  test("seule la première erreur est affichée, avec le nombre d'autres erreurs", () => {
    expect(
      messageOf({ Analyse: [{ Methode: 1 }, { Methode: 2 }, {}] })
    ).toMatchInlineSnapshot(`
      "✖ Invalid input: expected string, received number
        → at Analyse[0].Methode
      (+ 2 autres erreurs)"
    `);
  });
});
