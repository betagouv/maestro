import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'path';
import { encryptFile } from '../gpgService';
import { mailService } from '../mailService';
import { zip } from '../zipService';
import { getZipFileName, XmlFile } from './sachaToXML';

export const sendSachaFile = async (xmlFile: XmlFile, dateNow: number) => {
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
};
