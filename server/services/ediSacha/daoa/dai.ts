import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { sendSachaFile } from '../sachaSender';
import { generateXMLDAI, loadLaboratoryCall, XmlFile } from '../sachaToXML';

//FIXME à brancher avec la PPV
export const generateDAI = async (sample: Sample) => {
  let xmlFile: XmlFile | null = null;

  const itemsForLaboratories = sample.items.filter(
    ({ recipientKind, laboratoryId }) =>
      recipientKind === 'Laboratory' && !!laboratoryId
  );

  const dateNow = Date.now();

  for (const item of itemsForLaboratories) {
    if (sample.specificData.programmingPlanKind !== 'PPV') {
      //FIXME il manque les descripteurs spécifiques à la fiche de plan

      xmlFile = await generateXMLDAI(
        sample,
        item,
        loadLaboratoryCall(item.laboratoryId!),
        dateNow
      );
    }

    if (xmlFile) {
      await sendSachaFile(xmlFile, dateNow);
    }
  }
  return null;
};
