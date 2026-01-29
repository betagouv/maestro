import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { sendSachaFile } from './sachaSender';
import { generateXMLDAI, loadLaboratoryCall, XmlFile } from './sachaToXML';

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
      xmlFile = await generateXMLDAI(
        sample,
        item,
        loadLaboratoryCall(item.laboratoryId!),
        dateNow,
        {},
        {}
      );
    }

    if (xmlFile) {
      //FIXME EDI brancher PEL
      await sendSachaFile(xmlFile, dateNow, false);
    }
  }
  return null;
};
