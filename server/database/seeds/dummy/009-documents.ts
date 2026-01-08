import { Regulation201862DocumentFixture } from 'maestro-shared/test/documentFixtures';
import { Documents } from '../../../repositories/documentRepository';

export const seed = async function () {
  await Documents().insert(Regulation201862DocumentFixture);
};
