import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';
import { sendSachaFile } from './sachaSender';
import {
  generateXMLDAI,
  loadLaboratoryAndSachaConfCall,
  XmlFile
} from './sachaToXML';

//FIXME EDI à brancher avec la PPV
export const generateDAI = async (sample: SampleChecked) => {
  let xmlFile: XmlFile | null = null;

  const itemsForLaboratories = sample.items.filter(
    ({ recipientKind, laboratoryId }) =>
      recipientKind === 'Laboratory' && !!laboratoryId
  );

  const dateNow = Date.now();

  for (const item of itemsForLaboratories) {
    if (
      ProgrammingPlanKindWithSacha.options.includes(
        sample.specificData.programmingPlanKind as ProgrammingPlanKindWithSacha
      )
    ) {
      const sachaCommemoratifRecord =
        await sachaCommemoratifRepository.findAll();
      const specificDataRecord = await sampleSpecificDataRepository.findAll();
      xmlFile = await generateXMLDAI(
        sample,
        item,
        loadLaboratoryAndSachaConfCall(item.laboratoryId!),
        dateNow,
        specificDataRecord,
        sachaCommemoratifRecord
      );
    }

    if (xmlFile) {
      //FIXME EDI brancher PEL
      await sendSachaFile(xmlFile, dateNow, false);
    }
  }
  return null;
};
