import { z } from 'zod/v4';
import { MatrixDeprecated } from './Matrix';
import { MatrixLabels } from './MatrixLabels';

export const MatrixKindEffective = z.enum([
  'A00GY',
  'A00RT',
  'A00JD',
  'A04JS',
  'A001M',
  'A00FN',
  'A010V',
  'A03NJ',
  'A00TQ',
  'A00FX',
  'A015M',
  'A00JN',
  'A00LD',
  'A04MA',
  'A01EA',
  'A012B',
  'A00PX',
  'A01JT',
  'A042C',
  'A00KE',
  'A01BQ',
  'A01DT',
  'A0DQS',
  'A00HZ',
  'A01DV',
  'A001D',
  'A000L',
  'A00HQ',
  'A01QX',
  'A01RJ',
  'A01RL',
  'A01RG',
  'A01SN',
  'A031E'
]);

export const OtherMatrixKind = z.literal('Other');

export const MatrixKind = z.enum(
  [...MatrixDeprecated.options, ...MatrixKindEffective.options],
  {
    error: () => 'Veuillez renseigner la catégorie de matrice programmée.'
  }
);

export type MatrixKind = z.infer<typeof MatrixKind>;
export type OtherMatrixKind = z.infer<typeof OtherMatrixKind>;

export const MatrixKindList: MatrixKind[] = MatrixKind.options;

const MatrixDeprecatedLabels: Record<MatrixDeprecated, string> =
  Object.fromEntries(
    MatrixDeprecated.options
      .map((key) => [key, MatrixLabels[key]])
      .filter(([_, value]) => value !== undefined)
  );

export const MatrixKindLabels: Record<MatrixKind | OtherMatrixKind, string> = {
  ...MatrixDeprecatedLabels,
  A00KR: 'Légumes-feuilles',
  A012R: 'Légumes secs (graines séchées de légumineuse)',
  A00GY: 'Aulx et échalotes',
  A00RT: 'Asperges',
  A00JD: 'Aubergines',
  A04JS: 'Bananes',
  A001M: 'Blé (froment)',
  A00FN: 'Brocolis',
  A010V: 'Canne à sucre',
  A03NJ: 'Cerises',
  A00TQ: 'Champignons de couche',
  A00FX: 'Choux pommés',
  A015M: 'Colza',
  A00JN: 'Cucurbitacés à peau comestible',
  A00LD: 'Endives',
  A04MA: 'Fines herbes',
  A01EA: 'Fraises',
  A012B: 'Haricots et pois écossés frais',
  A00PX: 'Haricots et pois non écossés frais',
  A01JT: 'Kiwis',
  A042C: 'Laitues et scaroles',
  A00KE: 'Melons',
  A01BQ: 'Olives',
  A01DT: 'Petits fruits',
  A0DQS: 'Pitaya / fruits du Dragon',
  A00HZ: 'Poivrons/Piments',
  A01DV: 'Raisins',
  A001D: 'Riz',
  A000L: 'Sarrasin/Quinoa',
  A00HQ: 'Tomates',
  A01QX: 'Viande bovine',
  A01RJ: 'Viande ovine',
  A01RL: 'Viande caprine',
  A01RG: 'Viande porcine',
  A01SN: 'Viande de volaille',
  A031E: 'Œufs et ovoproduits',
  Other: 'Autre'
};
