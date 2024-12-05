import { isNil } from 'lodash';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { z } from 'zod';
import { SimpleResidueLabels } from '../../../shared/referential/Residue/SimpleResidueLabels';

const labos = ['LDA 72'] as const;
export type Labos = (typeof labos)[number];

const resultValidator = z.discriminatedUnion('result_kind',[z.object({
  result_kind: z.literal('NQ'),
  result: z.null()
}),z.object({result_kind: z.literal('Q'), result: z.number().nullable()})])


export const analysiesResiduesValidator = z.object(
  {reference: z.string().nullable() ,
    lmr: z.number().nullable(),
    result: resultValidator
  }
)
export type AnalysieResidues = z.infer<typeof analysiesResiduesValidator>
type ParseLaboDocument = (
  extractPageContentFunction: (
    page: number
  ) => ReturnType<typeof extractPageContent>
) => Promise<AnalysieResidues[] | null>;

const parseNovalysDocument: ParseLaboDocument = async (
  extractPageContentFunction
) => {
  const { content, valid } = await extractPageContentFunction(2);

  if (!valid) {
    return null;
  }

  const dateValidator = z.string().regex(/^\d{2}\/\d{2}\/\d{2}$/);
  const numberValidator = z.union([
    z
      .string()
      .transform((val) => Number(`${val}`.replace(',', '.')))
      .pipe(z.number()),
    z.literal('-')
  ]);
  const uniteValidator = z.literal('mg/kg');

  const lmrValidator = z.string()
    .refine(s => s !== 'M')
    .transform(s => {
      console.log(s)
      const {success, data} = z.coerce.number().safeParse(s.replace('<', ''))
      return success ? data : null
    })

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
       lmrValidator
      ]).transform((r) => ({substance: r[1], result: r[2], lmr: r[9]})),

      z.tuple([
        z.literal('M'),
        z.string(),
        z.union([numberValidator, z.literal('ND')]),
        uniteValidator,
        numberValidator,
        z.string(),
        z.string(),
        dateValidator,
      lmrValidator
      ]).transform((r) => ({substance: r[1], result: r[2], lmr: r[8]})),


      z.tuple([
        z.literal('M'),
        z.string(),
        z.union([numberValidator, z.literal('ND')]),
        uniteValidator,
        numberValidator,
        z.string(),
        z.string(),
        dateValidator
      ]).transform((r) => ({substance: r[1], result: r[2], lmr: null})),
      z.tuple([
        z.literal('M'),
        z.string(),
        z.literal('en annexe.'),
        dateValidator
      ]).transform(() => null),
      z.tuple([z.literal('Analyses à la carte')]).transform(() => null)
    ])
    .transform((r) => {
      if (r !== null) {

        //FIXME comment retrouver le bon résidu ?
        const ref = Object.entries(SimpleResidueLabels).find(([_key, value]) =>
          value
            .toLowerCase()
            .slice(0, 5)
            .includes(r.substance.toLowerCase().slice(0, 5))
        );
        const result: AnalysieResidues = {

          reference: ref?.[0] ?? null,
          result: r.result === 'ND' || r.result === '-' ? ({result_kind: 'NQ', result: null}) : ({result_kind: 'Q', result: r.result}),
          lmr: r.lmr
        }
        return result
      }
      return null;
    });

  const indexStart = content.findIndex((i) =>
    i.startsWith('Pesticides - Screening complet')
  );
  const indexEnd = content.findIndex((i) =>
    i.startsWith('Déclaration de conformité')
  );
  const itemsWithoutHeaders = content.slice(indexStart + 1, indexEnd);
  let index = 0;
  const lines : AnalysieResidues[]= [];
  do {
    for (let i = 10; i > 0; i--) {
      const { success, data } = lineValidator.safeParse(
        itemsWithoutHeaders.slice(index, index + i)
      );
      if (success && data !== null) {
        lines.push(data);
        index += i;
        break;
      } else {
        //  console.log(
        //    itemsWithoutHeaders.slice(index, index + i)
        // )
      }

      if (i === 1) {
        index += 1;
      }
    }
  } while (index < itemsWithoutHeaders.length);


  return lines;
};
export const parseDocument = {
  'LDA 72': parseNovalysDocument
} as const satisfies Record<Labos, ParseLaboDocument>;
//1e6f1197-b922-4d2c-9889-e8121ad5b892_DAP-GES-51-24-0039-A-3.pdf
export const extractAnalysisFromPdf = async (
  documentId: string,
  labo: Labos
): Promise<null | unknown> => {
  const doc = await getDocument(
    '../../../.terraform/7fd5bc47-55f6-4710-b67d-0cb1c62d91d2_ResultatHOUBLON_GES67240015A.pdf'
  ).promise;

  const result = await parseDocument[labo]((page) =>
    extractPageContent(doc, page)
  );
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

export const extractPageContent = async (
  doc: Pick<PDFDocumentProxy, 'getPage'>,
  pageNumber: number
): Promise<
  | { valid: true; content: string[]; error?: never }
  | { valid: false; error: string; content?: never }
> => {
  const page = await doc.getPage(pageNumber);
  const pageContent = await page.getTextContent();
  if (pageContent.items.length === 0) {
    return {
      valid: false,
      error: 'PDF non lisible car contient juste une image'
    };
  }
  return {
    valid: true,
    content: pageContent.items
      .filter((item): item is TextItem =>
        'str' in item ? item.str.trim().length > 0 : false
      )
      .map(({ str }) => str)
  };
};

// extractAnalysisFromPdf('toto')
//   .then(() => {
//     process.exit();
//   })
//   .catch((e) => {
//     console.error('Erreur', e);
//     process.exit(1);
//   });
