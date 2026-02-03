import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'path';
import config, { KafkaTopic } from '../../utils/config';
import { encryptFile } from '../gpgService';
import { sendMessage } from '../kafkaService';
import { mailService } from '../mailService';
import { zip } from '../zipService';
import { getZipFileName, SachaFileType, XmlFile } from './sachaToXML';

export const sendSachaFile = async (xmlFile: XmlFile, dateNow: number) => {
  const withPEL: boolean = !!config.kafka.url;
  //--- Without PEL
  if (!withPEL) {
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
  } else {
    //--- With PEL

    const kafkaTopicConf = {
      AN01: config.kafka.topicAN,
      DA01: config.kafka.topicDAI
    } as const satisfies Record<SachaFileType, KafkaTopic>;
    // Send with KAFKA
    await sendMessage(xmlFile.content, kafkaTopicConf[xmlFile.fileType]);
  }
};
