import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import OpenAI from 'openai';
import pdf from 'pdf-parse';
import DocumentMissingError from '../../../shared/errors/documentMissingError';
import { SimpleResidue } from '../../../shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from '../../../shared/referential/Residue/SimpleResidueLabels';
import documentRepository from '../../repositories/documentRepository';
import config from '../../utils/config';

interface ResidueExtraction {
  label: string;
  reference?: SimpleResidue;
  residueNumber: number;
  kind: 'Simple' | 'Complex';
  detected: boolean;
  compliance: 'Compliant' | 'NonCompliant' | 'Other';
}

export interface AnalyseExtraction {
  kind?: 'Mono' | 'Multi';
  residues?: ResidueExtraction[];
  compliance?: boolean;
  notesOnCompliance?: string | null;
}

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const retrieveReferences = async (
  analysisExtraction: AnalyseExtraction
): Promise<AnalyseExtraction> => {
  const openai = new OpenAI({
    apiKey: config.apis.openai.apiKey,
  });

  const prompt = `
    Tu es un assistant qui doit enrichir les labels dans un flux JSON avec les codes associés en te basant sur ${Object.entries(
      SimpleResidueLabels
    )}.
    Retrouve la ligne qui a le label le plus proche du texte sans accent traduit en anglais. 
    Tu dois retourner le JSON modifié. 
  
    Pour {"label": "Chlorméquat (+ sels)"} retourne {"label": "Chlormequat (sum of chlormequat and its salts, expressed as chlormequat-chloride)" ,"code":"RF-00005727-PAR"}.
    
    Réponds uniquement en JSON valide sans les balises \`\`\`json ou \`\`\`.
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      { role: 'user', content: JSON.stringify(analysisExtraction) },
    ],
  });

  console.log(analysisExtraction, completion.choices[0].message.content);

  return JSON.parse(
    completion.choices[0].message.content ?? '{}'
  ) as AnalyseExtraction;
};

export const extractFromReport = async (
  reportDocumentId: string
): Promise<AnalyseExtraction> => {
  //In the next lines, retrieve the document on S3 and parse it with pdf-parser
  const document = await documentRepository.findUnique(reportDocumentId);
  if (!document) {
    throw new DocumentMissingError(reportDocumentId);
  }

  const client = new S3(config.s3.client);
  const key = `${document.id}_${document.filename}`;

  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  const responseStream = await client.send(command);

  const data = await streamToBuffer(responseStream.Body as Readable);

  const result = await pdf(data);
  console.log('STREAM', result.text.replaceAll('\n', ' '));

  const openai = new OpenAI({
    apiKey: config.apis.openai.apiKey,
  });

  const prompt = `Tu es un assistant qui doit extraire les résidues détectés dans un rapport d'analyse et me retourner un JSON qui respecte l'interface suivante :
  {
    kind: 'Mono' | 'Multi';
    residues: {
      label: string; 
      residueNumber: number;
      kind: 'Simple' | 'Complex';
      resultKind: 'Q' | 'NQ';
      result: number | null;
      lmr: number | null;
      resultHigherThanArfd: boolean;
      notesOnResult: string | null;
      substanceApproved: boolean;
      substanceAuthorised: boolean;
      pollutionRisk: boolean | null;
      notesOnPollutionRisk: string | null;
      compliance: 'Compliant' | 'NonCompliant' | 'Other';
      detected: boolean;
    }[]; 
    compliance: boolean;
    notesOnCompliance: string | null;
  }
  Réponds uniquement en JSON valide sans les balises \`\`\`json ou \`\`\`.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      { role: 'user', content: result.text },
    ],
  });

  console.log(completion.choices[0].message.content);

  const analyseExtraction = JSON.parse(
    completion.choices[0].message.content ?? '{}'
  ) as AnalyseExtraction;

  return retrieveReferences(analyseExtraction);
};
