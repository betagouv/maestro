import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { toMaestroDate } from 'maestro-shared/utils/date';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'path';
import { encryptFile } from '../../gpgService';
import { mailService } from '../../mailService';
import { zip } from '../../zipService';
import {
  generateXMLDAI,
  getZipFileName,
  loadLaboratoryAndSenderCall,
  XmlFile
} from '../sachaToXML';
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
        loadLaboratoryAndSenderCall(item.laboratoryId!, sample.sampler.id),
        dateNow
      );
    }

    if (xmlFile) {
      //--- Without PEL
      // Create directory with xml file inside
      const directoryPath = path.join(tmpdir(), xmlFile.fileName);
      await mkdir(directoryPath);

      const filePath = path.join(directoryPath, `${xmlFile.fileName}.xml`);
      await writeFile(filePath, xmlFile.content);

      // Zip directory
      const zipFileName = getZipFileName(
        xmlFile.fileType,
        xmlFile.laboratory,
        dateNow
      );
      const zipFilePath = await zip(directoryPath, zipFileName);

      // Encrypt
      const laboratoryGpgEmail = xmlFile.laboratory.sachaEmail;
      const encryptFileName = `${zipFileName}.gpg`;
      const encryptFilePath = await encryptFile(
        zipFilePath,
        laboratoryGpgEmail,
        encryptFileName
      );
      const encryptFileBuffer = await readFile(encryptFilePath);

      // Send by email
      await mailService.send({
        templateName: 'GenericTemplate',
        attachment: [
          {
            name: encryptFileName,
            content: Buffer.from(encryptFileBuffer).toString('base64')
          }
        ],
        recipients: [laboratoryGpgEmail],
        params: {
          object: zipFileName,
          content: zipFileName
        }
      });

      //--- With PEL
      // Send with KAFKA
    }
  }
  return null;
};
