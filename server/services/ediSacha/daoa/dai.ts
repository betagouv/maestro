import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { toMaestroDate } from 'maestro-shared/utils/date';
import { generateXMLDAI } from '../sachaToXML';
import { DAI, toSachaDateTime } from '../sachaValidator';

export const generateDAI = (
  sample: Sample & { programmingPlanKind: 'DAOA_SLAUGHTER' }
) => {
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
          Nom: sample.sampler.name
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
            NumeroEtiquette: sample.items[0].sealId
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

    return generateXMLDAI(dai, 'CAP 29');
  }

  return null;
};
