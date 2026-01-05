import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { toMaestroDate } from 'maestro-shared/utils/date';
import { sendSachaFile } from '../sachaSender';
import { generateXMLDAI, loadLaboratoryCall, XmlFile } from '../sachaToXML';
import { DAI, toSachaDateTime } from '../sachaValidator';

export const generateDAI = async (sample: Sample) => {
  let xmlFile: XmlFile | null = null;

  const itemsForLaboratories = sample.items.filter(
    ({ recipientKind, laboratoryId }) =>
      recipientKind === 'Laboratory' && !!laboratoryId
  );

  const dateNow = Date.now();

  for (const item of itemsForLaboratories) {
    if (sample.specificData.programmingPlanKind === 'DAOA_SLAUGHTER') {
      const dai: DAI['DemandeType'] = {
        DialogueDemandeIntervention: {
          //FIXME on attend un number ici
          NumeroDAP: 1, // getSupportDocumentFilename(sample, 1),
          //FIXME il faut celui de DAOA
          SigleContexteIntervention: '',
          DateIntervention: toMaestroDate(sample.sampledAt),
          DateModification: toSachaDateTime(sample.lastUpdatedAt)
        },
        ReferenceEtablissementType: {
          ReferenceEtablissement: {
            //FIXME
            SigleIdentifiant: '',
            Identifiant: sample.company.name,
            Nom: sample.company.name,
            CodePostal: `${sample.company.postalCode ?? ''} ${sample.company.city ?? ''}`,
            Adresse1: sample.company.address ?? undefined,
            Email: sample.ownerEmail ?? undefined
          }
        },
        DialogueActeurType: {
          DialogueActeur: {
            //FIXME
            SigleIdentifiant: '',
            Identifiant: '',
            Nom: sample.sampler.name ?? ''
            //FIXME email
          }
        },
        DialogueEchantillonCommemoratifType: [
          {
            DialogueEchantillonComplet: {
              NumeroEchantillon: 1,
              //FIXME
              SigleMatriceSpecifique: '',
              NumeroIdentificationExterne: 'ECHANTILLON 1',
              //FIXME on le met où le numéro de scellé !?
              NumeroEtiquette: sample.items[0].sealId.substring(0, 27)
            }
          }
        ],
        ReferencePlanAnalyseType: {
          ReferencePlanAnalyseEffectuer: {
            SiglePlanAnalyse: ''
          },
          ReferencePlanAnalyseContenu: {
            LibelleMatrice: '',
            SigleAnalyte: '',
            SigleMethodeSpecifique: '',
            Depistage: false,
            Confirmation: false,
            Statut: 'G'
          }
        }
      };

      xmlFile = await generateXMLDAI(
        dai,
        loadLaboratoryCall(item.laboratoryId!),
        sample.department,
        dateNow
      );
    }

    if (xmlFile) {
      await sendSachaFile(xmlFile, dateNow);
    }
  }
  return null;
};
