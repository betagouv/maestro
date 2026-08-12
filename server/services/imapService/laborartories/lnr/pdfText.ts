import { extractText, getDocumentProxy } from 'unpdf';

export const extractPdfText = async (content: Buffer): Promise<string> => {
  const pdf = await getDocumentProxy(new Uint8Array(content));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
};
