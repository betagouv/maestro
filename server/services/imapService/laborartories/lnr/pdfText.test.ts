import { PDFDocument, StandardFonts } from 'pdf-lib';
import { expect, test } from 'vitest';
import { extractPdfText } from './pdfText';

// build fake pdf
const buildPdf = async (lines: string[]): Promise<Buffer> => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([595, 842]);

  lines.forEach((line, index) => {
    page.drawText(line, { x: 40, y: 780 - index * 20, size: 10, font });
  });

  return Buffer.from(await pdf.save());
};

test('extractPdfText restitue le texte, une ligne par ligne dessinée', async () => {
  const lines = [
    'Unite de mesure : mg/kg de produit',
    'quantification Incertitude LMR',
    'ALDRINE < LQ 0,005 50 % -',
    'DIELDRINE < LQ 0,005 50 % -'
  ];

  const text = await extractPdfText(await buildPdf(lines));

  for (const line of lines) {
    expect(text).toContain(line);
  }
});
