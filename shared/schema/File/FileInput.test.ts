import { describe, expect, test } from 'vitest';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  test.each<[any, string[]]>([
    [
      null,
      [
        'Veuillez sélectionner un fichier.',
        'Le fichier est trop volumineux.',
        "Ce type de fichier n'est pas accepté."
      ]
    ],
    [
      '',
      [
        'Veuillez sélectionner un fichier.',
        'Le fichier est trop volumineux.',
        "Ce type de fichier n'est pas accepté."
      ]
    ],
    [
      new File([], 'filename.txt', { type: 'plain/text' }),
      ["Ce type de fichier n'est pas accepté."]
    ]
  ])('vérifie le validator échoue', (object, errors) => {
    const parsed = FileInput().safeParse(object);
    expect(parsed.success).toBeFalsy();
    expect(parsed.error?.format()._errors).toEqual(errors);
  });

  test('vérifie que le validator fonctionne', () => {
    const parsed = FileInput().safeParse(
      new File([], 'filename.txt', { type: 'application/pdf' })
    );
    expect(parsed.success).toBeTruthy();
  });
});
