import { LaboratoryAnalyticalCompetence } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import { knexInstance as db } from './db';

const laboratoryAnalyticalCompetencesTable =
  'laboratory_analytical_competences';

export const LaboratoryAnalyticalCompetences = () =>
  db<LaboratoryAnalyticalCompetence>(laboratoryAnalyticalCompetencesTable);

const findManyByLaboratoryId = async (
  laboratoryId: string
): Promise<LaboratoryAnalyticalCompetence[]> => {
  console.info(
    'Find laboratory analytical competences for laboratory',
    laboratoryId
  );

  return LaboratoryAnalyticalCompetences()
    .where({ laboratoryId })
    .then((results) =>
      results.map((_: any) => LaboratoryAnalyticalCompetence.parse(_))
    );
};

const update = async (
  analyticalCompetence: LaboratoryAnalyticalCompetence
): Promise<void> => {
  console.info(
    'Update laboratory analytical competence',
    analyticalCompetence.id
  );

  await LaboratoryAnalyticalCompetences()
    .where({ id: analyticalCompetence.id })
    .update(analyticalCompetence);
};

export default {
  findManyByLaboratoryId,
  update
};
