import { isNil } from 'lodash';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { z } from 'zod';
import { assertUnreachable } from '../../../shared/utils/typescript';
import { SimpleResidueLabels } from '../../../shared/referential/Residue/SimpleResidueLabels';

const labos = ['INOVALYS'] as const;
export type Labos = (typeof labos)[number];

type ParseLaboDocument =  (extractPageContentFunction: (page: number) => Promise<string[]>) => Promise<null>
const parseNovalysDocument: ParseLaboDocument = async (extractPageContentFunction) => {
  const content = await extractPageContentFunction(2);

  const dateValidator = z.string().regex(/^\d{2}\/\d{2}\/\d{2}$/);
  const numberValidator = z.union([
    z
      .string()
      .transform((val) => Number(`${val}`.replace(',', '.')))
      .pipe(z.number()),
    z.literal('-')
  ]);
  const uniteValidator = z.literal('mg/kg');

  const lineValidator = z
    .union([
      z.tuple([
        z.literal('M'),
        z.string(),
        numberValidator,
        z.string(),
        uniteValidator,
        numberValidator,
        z.string(),
        z.string(),
        dateValidator,
        z.string().refine((s) => s !== 'M'),
      ]),
      z.tuple([
        z.literal('M'),
        z.string(),
        z.union([numberValidator, z.literal('ND')]),
        uniteValidator,
        numberValidator,
        z.string(),
        z.string(),
        dateValidator,
        z.string().refine((s) => s !== 'M'),
      ]),

      z.tuple([
        z.literal('M'),
        z.string(),
        z.union([numberValidator, z.literal('ND')]),
        uniteValidator,
        numberValidator,
        z.string(),
        z.string(),
        dateValidator,
      ]),
      z.tuple([
        z.literal('M'),
        z.string(),
        z.literal('en annexe.'),
        dateValidator
      ]),
     z.tuple([ z.literal('Analyses à la carte')])
    ])
    .transform((r) => {
      if( r.length > 5){
        const substance: string = r[1] ?? ''

        //FIXME comment retrouver le bon résidu ?
        const ref = Object.entries(SimpleResidueLabels).find(([key, value]) => value.toLowerCase().slice(0, 5).includes(substance.toLowerCase().slice(0, 5)))
      return {
        substance: ref?.[0],
        teneur: r[2],
        LMR: r[9]
      }
    }
    return null
    });

  const indexStart = content.findIndex((i) =>
    i.startsWith('Pesticides - Screening complet')
  );
  const indexEnd = content.findIndex((i) =>
    i.startsWith('Déclaration de conformité')
  );
  const itemsWithoutHeaders = content.slice(indexStart + 1, indexEnd);
  let index = 0;
  const lines = [];
  do {
    for (let i = 10; i >0; i--) {
      const { success, data } = lineValidator.safeParse(
        itemsWithoutHeaders.slice(index, index + i)
      );
      if (success) {
        lines.push(data);
        index += i;
        break
      }else{
       //  console.log(
       //    itemsWithoutHeaders.slice(index, index + i)
       // )
      }

      if( i === 1 ){
        console.log('haha', itemsWithoutHeaders.slice(index, index + 10))
        index += 1
      }
    }
  } while (index < itemsWithoutHeaders.length);

  console.log(indexStart, indexEnd);
  // console.log(items.slice(indexStart, indexEnd))
  console.log('coucou', lines.filter(l => !isNil(l)));
  return null;
};
export const parseDocument = {
  INOVALYS: parseNovalysDocument
} as const satisfies Record<Labos, ParseLaboDocument>;
//1e6f1197-b922-4d2c-9889-e8121ad5b892_DAP-GES-51-24-0039-A-3.pdf
export const extractAnalysisFromPdf = async (
  documentId: string
): Promise<null | unknown> => {
  const doc = await getDocument(
    '../../../.terraform/7fd5bc47-55f6-4710-b67d-0cb1c62d91d2_ResultatHOUBLON_GES67240015A.pdf'
  ).promise;

  const linesFirstPage = await extractPageContent(doc, 1);
  const labo = getLabo(linesFirstPage);

  if (isNil(labo)) {
    console.log('Aucun laboratoire trouvé pour ce rapport', linesFirstPage);
    return null;
  }
  console.log('Laboratoire trouvé : ', labo);

  const result = await parseDocument[labo]((page) => extractPageContent(doc, page));
  if (isNil(result)) {
    console.log(
      "Impossible d'extraire les données du document pour le labo : ",
      labo,
      documentId
    );
    return null;
  }
  return result;
};

//FIXME peut-être que ça sert à rien car on a peut-être déjà le labo dans la bdd
const getLabo = (linesFirstPage: string[]): Labos | null => {
  for (const labo of labos) {
    switch (labo) {
      case 'INOVALYS':
        if (linesFirstPage.find((l) => l.includes('Inovalys'))) {
          return 'INOVALYS';
        }
        break;
      default:
        assertUnreachable(labo);
    }
  }

  return null;
};

export const extractPageContent = async (
  doc: Pick<PDFDocumentProxy, 'getPage'>,
  pageNumber: number
): Promise<string[]> => {
  const page = await doc.getPage(pageNumber);
  const pageContent = await page.getTextContent();
  return pageContent.items
    .filter((item): item is TextItem =>
      'str' in item ? item.str.trim().length > 0 : false
    )
    .map(({ str }) => str);
};

// extractAnalysisFromPdf('toto')
//   .then(() => {
//     process.exit();
//   })
//   .catch((e) => {
//     console.error('Erreur', e);
//     process.exit(1);
//   });
