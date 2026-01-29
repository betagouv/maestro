import { getAllSachaAttributes } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';

/*
Permet de créer une configuration Sacha non valide en bdd pour chaque attribut non présent en bdd
 */
export const initSampleSpecificDataAttributes = async () => {
  const sampleSpecificDataRecord = await sampleSpecificDataRepository.findAll();

  const allSachaAttributes = getAllSachaAttributes();

  for (const attribute of allSachaAttributes) {
    if (!(attribute in sampleSpecificDataRecord)) {
      await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
        attribute,
        inDai: true,
        sachaCommemoratifSigle: null
      });
    }
  }
};
