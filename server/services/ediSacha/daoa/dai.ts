import { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { toMaestroDate } from 'maestro-shared/utils/date';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'path';
import { encryptFile } from '../../gpgService';
import { mailService } from '../../mailService';
import { zip } from '../../zipService';
import { generateXMLDAI, XmlFile } from '../sachaToXML';
import { DAI, toSachaDateTime } from '../sachaValidator';

export const generateDAI = async (sample: Sample) => {
  let xmlFile: XmlFile | null = null;

  // TODO
  const laboratoryName: LaboratoryShortName = 'CAP 29';
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

    xmlFile = generateXMLDAI(dai, laboratoryName, Date.now());
  }

  if (xmlFile) {
    //--- Without PEL
    // Create directory with xml file inside
    const directoryPath = path.join(tmpdir(), xmlFile.fileName);
    await mkdir(directoryPath);

    const filePath = path.join(directoryPath, `${xmlFile.fileName}.xml`);
    await writeFile(filePath, xmlFile.content);

    // Zip directory
    const zipFileName = `${xmlFile.fileName}.zip`;
    const zipFilePath = await zip(directoryPath, zipFileName);

    // Encrypt
    // TODO
    const laboratoryGpgEmail = 'admin@maestro.beta.gouv.fr';
    const encryptFileName = `${zipFileName}.gpg`;
    const encryptFilePath = await encryptFile(
      zipFilePath,
      laboratoryGpgEmail,
      encryptFileName
    );
    const encryptFileBuffer = await readFile(encryptFilePath);

    // Send by email or FTP
    await mailService.send({
      //TODO use generic template
      templateName: 'AnalysisReviewTodoTemplate',
      attachment: [
        {
          name: encryptFileName,
          content: Buffer.from(encryptFileBuffer).toString('base64')
        }
      ],
      recipients: [laboratoryGpgEmail],
      params: {
        link: 'https://maestro.beta.gouv.fr'
      }
    });

    //--- With PEL
    // Send with KAFKA
  }
  return null;
};
