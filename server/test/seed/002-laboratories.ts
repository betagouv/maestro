import { DummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import {
  genLaboratory,
  Laboratory1AnalyticalCompetenceFixture1,
  Laboratory1AnalyticalCompetenceFixture2,
  LaboratoryFixture
} from 'maestro-shared/test/laboratoryFixtures';
import { LaboratoryAnalyticalCompetences } from '../../repositories/laboratoryAnalyticalCompetenceRepository';
import { Laboratories } from '../../repositories/laboratoryRepository';

export const seed = async (): Promise<void> => {
  await Laboratories().insert([
    LaboratoryFixture,
    ...DummyLaboratoryIds.map((id) => genLaboratory({ id }))
  ]);

  await LaboratoryAnalyticalCompetences().insert([
    Laboratory1AnalyticalCompetenceFixture1,
    Laboratory1AnalyticalCompetenceFixture2
  ]);
};
