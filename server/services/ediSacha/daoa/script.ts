import { genCreatedSample } from 'maestro-shared/test/sampleFixtures';
import { generateDAI } from './dai';

//TODO delete me
const launch = async () => {
  await generateDAI(
    genCreatedSample({
      matrixKind: 'A0D9Y',
      department: '01',
      specificData: {
        programmingPlanKind: 'DAOA_SLAUGHTER',
        killingCode: 'aaaa',
        animalIdentifier: 'bbbb',
        animalKind: 'TYPEA1',
        sex: 'SEX1',
        age: 12,
        productionKind: 'PROD_1',
        productionMethod: 'PROD_1'
      }
    })
  );
};

export default launch()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
