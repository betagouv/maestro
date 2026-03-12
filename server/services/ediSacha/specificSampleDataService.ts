import { getAllSachaAttributes } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';
import { specificDataFieldConfigRepository } from '../../repositories/specificDataFieldConfigRepository';

/*
Permet de créer une configuration Sacha non valide en bdd pour chaque attribut non présent en bdd
 */
export const initSampleSpecificDataAttributes = async () => {
  const sachaFieldConfigs =
    await specificDataFieldConfigRepository.findSachaFields();

  const allSachaAttributes = getAllSachaAttributes();

  for (const attribute of allSachaAttributes) {
    if (!sachaFieldConfigs.some((fc) => fc.key === attribute)) {
      await sampleSpecificDataRepository.updateSampleSpecificDataAttribute({
        attribute,
        inDai: true,
        sachaCommemoratifSigle: null,
        optional: false
      });
    }
  }
};
