import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import { DummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import {
  genLaboratory,
  Laboratory1AnalyticalCompetenceFixture1,
  Laboratory1AnalyticalCompetenceFixture2,
  LaboratoryFixture
} from 'maestro-shared/test/laboratoryFixtures';
import { LaboratoryAnalyticalCompetences } from '../../repositories/laboratoryAnalyticalCompetenceRepository';
import { Laboratories } from '../../repositories/laboratoryRepository';

export const toDbRow = (lab: LaboratoryWithSacha) => ({
  id: lab.id,
  shortName: lab.shortName,
  name: lab.name,
  address: lab.address,
  postalCode: lab.postalCode,
  city: lab.city,
  emails: lab.emails,
  legacyDai: lab.legacyDai,
  sachaActivated: lab.sacha?.activated ?? false,
  sachaSigle: lab.sacha?.sigle ?? null,
  sachaCommunicationMethod: lab.sacha?.communication?.method ?? null,
  sachaEmail:
    lab.sacha?.communication?.method === 'EMAIL'
      ? lab.sacha.communication.email
      : null,
  sachaGpgPublicKey:
    lab.sacha?.communication?.method === 'EMAIL'
      ? lab.sacha.communication.gpgPublicKey
      : null,
  sachaSftpLogin:
    lab.sacha?.communication?.method === 'SFTP'
      ? lab.sacha.communication.sftpLogin
      : null
});

export const seed = async (): Promise<void> => {
  await Laboratories().insert([
    toDbRow(LaboratoryFixture),
    ...DummyLaboratoryIds.map((id) => toDbRow(genLaboratory({ id })))
  ]);

  await LaboratoryAnalyticalCompetences().insert([
    Laboratory1AnalyticalCompetenceFixture1,
    Laboratory1AnalyticalCompetenceFixture2
  ]);
};
