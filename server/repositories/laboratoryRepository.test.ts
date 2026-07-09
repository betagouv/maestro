import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { kysely } from './kysely';
import { laboratoryRepository } from './laboratoryRepository';

describe('findByEmailSender', async () => {
  const email = 'monemail@maestro.gouv.fr';
  beforeAll(async () => {
    await kysely
      .updateTable('laboratories')
      .set({
        emailsAnalysisResult: [email]
      })
      .where('shortName', '=', LaboratoryFixture.shortName)
      .execute();
  });

  test('not found', async () => {
    const laboratory =
      await laboratoryRepository.findByEmailSender('fakeEmail');
    expect(laboratory).toEqual(undefined);
  });

  test('found', async () => {
    const laboratory = await laboratoryRepository.findByEmailSender(email);
    expect(laboratory?.shortName).toEqual(LaboratoryFixture.shortName);
  });
});

describe('findUnique', () => {
  test('renvoie la configuration admin complète incluant emailsAnalysisResult', async () => {
    await kysely
      .updateTable('laboratories')
      .set({
        emailsAnalysisResult: ['analysis-result@maestro.gouv.fr']
      })
      .where('id', '=', LaboratoryFixture.id)
      .execute();

    const laboratory = await laboratoryRepository.findUnique(
      LaboratoryFixture.id
    );

    expect(laboratory.id).toEqual(LaboratoryFixture.id);
    expect(laboratory.shortName).toEqual(LaboratoryFixture.shortName);
    expect(laboratory.emailsAnalysisResult).toEqual([
      'analysis-result@maestro.gouv.fr'
    ]);
  });

  test("throw quand l'identifiant ne correspond à aucun laboratoire", async () => {
    await expect(
      laboratoryRepository.findUnique('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrow();
  });
});

describe('findBySachaSigle', () => {
  beforeAll(async () => {
    await kysely
      .updateTable('laboratories')
      .set({ sachaSigle: 'SIG49', legacyDai: false })
      .where('id', '=', LaboratoryFixture.id)
      .execute();
  });

  test('renvoie le laboratoire pour un sigle connu', async () => {
    const laboratory = await laboratoryRepository.findBySachaSigle('SIG49');
    expect(laboratory?.id).toEqual(LaboratoryFixture.id);
    expect(laboratory?.sacha?.sigle).toEqual('SIG49');
  });

  test('renvoie null pour un sigle inconnu', async () => {
    const laboratory =
      await laboratoryRepository.findBySachaSigle('SIGLE_INCONNU');
    expect(laboratory).toBeNull();
  });

  test('sigle en doublon, renvoie un labo activé', async () => {
    const [labA, labB] = await kysely
      .selectFrom('laboratories')
      .select('id')
      .where('id', '!=', LaboratoryFixture.id)
      .orderBy('id')
      .limit(2)
      .execute();

    await kysely
      .updateTable('laboratories')
      .set({ sachaSigle: 'SIGDUP', legacyDai: false, sachaActivated: false })
      .where('id', '=', labA.id)
      .execute();
    await kysely
      .updateTable('laboratories')
      .set({ sachaSigle: 'SIGDUP', legacyDai: false, sachaActivated: true })
      .where('id', '=', labB.id)
      .execute();

    const laboratory = await laboratoryRepository.findBySachaSigle('SIGDUP');
    expect(laboratory?.id).toEqual(labB.id);
    expect(laboratory?.sacha?.activated).toBe(true);
  });
});

describe('updateConfig', () => {
  beforeEach(async () => {
    await kysely
      .updateTable('laboratories')
      .set({
        emails: ['contact@labo.fr'],
        emailsAnalysisResult: ['analysis@labo.fr'],
        legacyDai: false,
        sachaActivated: false,
        sachaSigle: null,
        sachaCommunicationMethod: null,
        sachaRecipientEmail: null,
        sachaGpgEmail: null,
        sachaGpgPublicKey: null,
        sachaSftpLogin: null
      })
      .where('id', '=', LaboratoryFixture.id)
      .execute();
  });

  test('met à jour les emails et passe sacha en null quand sacha=null', async () => {
    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['nouveau@labo.fr'],
      emailsAnalysisResult: ['nouveau-result@labo.fr'],
      legacyDai: false,
      sacha: null
    });

    const lab = await laboratoryRepository.findUnique(LaboratoryFixture.id);
    expect(lab.emails).toEqual(['nouveau@labo.fr']);
    expect(lab.emailsAnalysisResult).toEqual(['nouveau-result@labo.fr']);
    expect(lab.legacyDai).toBe(false);
    expect(lab.sacha).toEqual({
      activated: false,
      sigle: null,
      communication: null
    });
  });

  test('persiste une configuration SACHA en EMAIL', async () => {
    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['contact@labo.fr'],
      emailsAnalysisResult: ['analysis@labo.fr'],
      legacyDai: false,
      sacha: {
        activated: true,
        sigle: 'LAB1',
        communication: {
          method: 'EMAIL',
          recipientEmail: 'sacha@labo.fr',
          gpgEmail: 'sacha-gpg@labo.fr',
          gpgPublicKey: 'PUBLIC_KEY'
        }
      }
    });

    const lab = await laboratoryRepository.findUnique(LaboratoryFixture.id);
    expect(lab.sacha).toEqual({
      activated: true,
      sigle: 'LAB1',
      communication: {
        method: 'EMAIL',
        recipientEmail: 'sacha@labo.fr',
        gpgEmail: 'sacha-gpg@labo.fr',
        gpgPublicKey: 'PUBLIC_KEY'
      }
    });
  });

  test('persiste une configuration SACHA en SFTP', async () => {
    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['contact@labo.fr'],
      emailsAnalysisResult: ['analysis@labo.fr'],
      legacyDai: false,
      sacha: {
        activated: true,
        sigle: 'LAB1',
        communication: { method: 'SFTP', sftpLogin: 'sftp-user' }
      }
    });

    const lab = await laboratoryRepository.findUnique(LaboratoryFixture.id);
    expect(lab.sacha).toEqual({
      activated: true,
      sigle: 'LAB1',
      communication: { method: 'SFTP', sftpLogin: 'sftp-user' }
    });
  });

  test('réinitialise les anciens champs SACHA quand on bascule de EMAIL à SFTP', async () => {
    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['contact@labo.fr'],
      emailsAnalysisResult: ['analysis@labo.fr'],
      legacyDai: false,
      sacha: {
        activated: true,
        sigle: null,
        communication: {
          method: 'EMAIL',
          recipientEmail: 'sacha@labo.fr',
          gpgEmail: 'sacha-gpg@labo.fr',
          gpgPublicKey: 'PUBLIC_KEY'
        }
      }
    });

    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['contact@labo.fr'],
      emailsAnalysisResult: ['analysis@labo.fr'],
      legacyDai: false,
      sacha: {
        activated: true,
        sigle: null,
        communication: { method: 'SFTP', sftpLogin: 'sftp-user' }
      }
    });

    const row = await kysely
      .selectFrom('laboratories')
      .selectAll()
      .where('id', '=', LaboratoryFixture.id)
      .executeTakeFirstOrThrow();
    expect(row.sachaRecipientEmail).toBeNull();
    expect(row.sachaGpgEmail).toBeNull();
    expect(row.sachaGpgPublicKey).toBeNull();
    expect(row.sachaSftpLogin).toEqual('sftp-user');
    expect(row.sachaCommunicationMethod).toEqual('SFTP');
  });

  test('legacyDai=true force sacha à null et vide tous les champs SACHA', async () => {
    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['contact@labo.fr'],
      emailsAnalysisResult: ['analysis@labo.fr'],
      legacyDai: false,
      sacha: {
        activated: true,
        sigle: 'LAB1',
        communication: { method: 'SFTP', sftpLogin: 'sftp-user' }
      }
    });

    await laboratoryRepository.updateConfig(LaboratoryFixture.id, {
      emails: ['contact@labo.fr'],
      emailsAnalysisResult: ['analysis@labo.fr'],
      legacyDai: true,
      sacha: null
    });

    const lab = await laboratoryRepository.findUnique(LaboratoryFixture.id);
    expect(lab.legacyDai).toBe(true);
    expect(lab.sacha).toBeNull();

    const row = await kysely
      .selectFrom('laboratories')
      .selectAll()
      .where('id', '=', LaboratoryFixture.id)
      .executeTakeFirstOrThrow();
    expect(row.sachaActivated).toBe(false);
    expect(row.sachaSigle).toBeNull();
    expect(row.sachaCommunicationMethod).toBeNull();
    expect(row.sachaRecipientEmail).toBeNull();
    expect(row.sachaGpgEmail).toBeNull();
    expect(row.sachaGpgPublicKey).toBeNull();
    expect(row.sachaSftpLogin).toBeNull();
  });
});
