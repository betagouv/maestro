import { z } from 'zod';

export const MatrixKind = z.enum(
  [
    'A0EZF',
    'A0EZV',
    'A00KR',
    'A00SF',
    'A00FL',
    'A0ESZ',
    'A00RR',
    'A00GX',
    'A00PB',
    'A00HN',
    'A00QF',
    'A0ETF',
    'A0ETG',
    'A00ZA',
    'A011Y',
    'A012R',
    'A0BY9',
    'A04RK',
    // 'A01QE',
    'A0BY3',
    'A014C',
    'A01BJ',
    'A015F',
    'A016L',
    'A00ZS',
    'A011B',
    'A0ETE',
    'A0ESQ',
    'A04MA',
    'A04LZ',
    'A0F0H',
    'A017X',
    'A01AK',
    'A01AT',
    'A019S',
    'A019Z',
    'A018Q',
    'A0EZJ',
    'A0BX9',
    'A04MN',
    'A0BY8',
    'A0ETV',
    'A0ETX',
    'A0ETY',
    'A0ESS',
    'A03JB',
    'A04JB',
    'A03JS',
    'A0ETK',
    'A0BYA',
    'A0C6D',
    'A03KA',
    'A03KL',
    'A03KY',
    'A03LB',
    'A03LG',
    'A03MA',
    'A03MS',
    'A03NS',
    'A03PD',
    'A03PM',
    // 'A16RG',
    'A0EQD',
    'A0EQS',
    // 'A034T',
    'A0EQQ',
    'A0EQR',
    'A035N',
    'A03PX',
    'A03RL',
    'A03VB',
    'A041K',
    'A0C68',
    'A0EZX',
    // 'A18TH',
    'A042P',
    'A042Y',
    'A0EQE',
    'A04QN',
    'A046F',
    'A036M',
    'A0BY6',
    'A0F7R',
    'A0ETM',
    'A0EVD',
    'A046L',
    'A0EVE',
    'A0BXY',
    'A16PP',
  ],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner la catégorie de matrice.',
    }),
  }
);

export type MatrixKind = z.infer<typeof MatrixKind>;

export const MatrixKindList: MatrixKind[] = MatrixKind.options;

export const MatrixKindLabels: Record<MatrixKind, string> = {
  A0EZF: 'Grains de céréales et similaires et leurs dérivés primaires',
  A0EZV: 'Produits à base de pâte de céréale',
  A00KR: 'Légumes-feuilles',
  A00SF: 'Graines germées, pousses et similaires',
  A00FL: "Choux (développement de l'inflorescence)",
  A0ESZ: 'Fleurs utilisées comme légumes',
  A00RR: 'Tiges/pédoncules consommés comme légumes',
  A00GX: 'Légumes-bulbes',
  A00PB: 'Légumineuses non écossées',
  A00HN: 'Légumes-fruits',
  A00QF:
    "Légumes-racines et légumes-tubercules à l'exclusion des espèces amylacées et sucrières",
  A0ETF: 'Plantes dont le tissu végétatif est utilisé comme aliment',
  A0ETG: 'Champignons',
  A00ZA: 'Légumes transformés ou conservés et similaires',
  A011Y: 'Graines fraîches de légumineuses (haricots, pois, etc.) ',
  A012R: 'Légumes secs (graines séchées de légumineuse)',
  A0BY9: 'Légumineuses transformées ou conservées',
  A04RK: 'Fruit frais',
  // A01QE: "Zeste d'agrume",
  A0BY3: 'Fruits transformés ou conservés',
  A014C: 'Fruits à coque',
  A01BJ: 'Dérivés primaires de fruits à coque et de graines similaires',
  A015F: 'Graines oléagineuses',
  A016L: 'Fruits oléagineux',
  A00ZS: 'Racines et tubercules amylacés',
  A011B: 'Produits à base de racines et tubercules amylacés',
  A0ETE: 'Racines utilisées comme source de sucre',
  A0ESQ: 'Tiges/cannes/sève ou espèces sucrières similaires ',
  A04MA: 'Herbes aromatiques',
  A04LZ: 'Fleurs aromatiques',
  A0F0H: 'Fleurs ou parties de fleur utilisées comme épices ou analogues',
  A017X: 'Épices en graines',
  A01AK: 'Boutons - épices',
  A01AT: 'Arilles - épices',
  A019S: 'Écorces- épies',
  A019Z: 'Racines ou rhizomes',
  A018Q: 'Fruits - épices',
  A0EZJ: 'Fines herbes et épices transformées ou conservées et similaires',
  A0BX9: 'Jus et nectars de fruits/légumes',
  A04MN: 'Pâtes à tartiner à base de fruits/légumes et similaires',
  A0BY8:
    "Liquide ou gel issus de l'extraction de produits primaires bruts d'origine végétale",
  A0ETV: 'Concentré de jus de fruit/légume ',
  A0ETX: 'Jus de fruit/légume en poudre',
  A0ETY: "Extraits d'origine végétale",
  A0ESS: 'Feuilles pour infusions ou boissons chaudes',
  A03JB: 'Fleurs utilisées pour les infusions',
  A04JB:
    'Graines (café, cacao et similaires) pour infusions ou boissons chaudes',
  A03JS: 'Infusions à partir de racines',
  A0ETK: "Ingrédients pour infusions ou boissons chaudes d'origines diverses",
  A0BYA:
    'Dérivés de café, cacao, thé brut et produits primaires bruts similaires',
  A0C6D: 'Ingrédients composés pour boissons chaudes et infusions',
  A03KA: 'Cafés (boissons)',
  A03KL: 'Boissons à base de succédané de café',
  A03KY: 'Boissons à base de cacao',
  A03LB: 'Thés',
  A03LG: 'Tisanes et autres infusions autres que le thé',
  A03MA: 'Bières et boissons ressemblant à la bière',
  A03MS: 'Vins et boissons ressemblant à du vin',
  A03NS: 'Liqueurs',
  A03PD: 'Spiritueux non sucrés',
  A03PM: 'Mélange de boissons alcoolisées',
  // A16RG: 'Edible alcohol',
  A0EQD: 'Chocolat et similaires',
  A0EQS: 'Produits à base de chocolat/cacao',
  // A034T: 'Succédanés de chocolat',
  A0EQQ: 'Bonbons (mous et durs)',
  A0EQR: 'Barres sucrées et autres pâtes sucrées façonnées',
  A035N: 'Pâte sucrée basique',
  A03PX: 'Aliments pour nourrissons et enfants en bas âge',
  A03RL: 'Autres aliments pour nourrissons et enfants',
  A03VB:
    "Plats, y compris les plats préparés (à l'exclusion des soupes et des salades)",
  A041K: 'Soupes et salades',
  A0C68: 'Desserts et crèmes glacées à manger à la cuillère (générique)',
  A0EZX: 'Céréales frites ou extrudées ou produits à base de racine',
  // A18TH: 'Tropical root and tuber vegetable dishes',
  A042P: 'Sel',
  A042Y: "Mélanges d'assaisonnement",
  A0EQE: 'Extraits et ingrédients pour sauce salés',
  A04QN: 'Condiments (y compris les formats de table)',
  A046F: 'Sauces/nappages pour dessert',
  A036M:
    'Matières grasses et huiles animales et végétales et leurs dérivés primaires',
  A0BY6: 'Sucres et similaires',
  A0F7R: "Formulations d'édulcorants de table",
  A0ETM: 'Amidons',
  A0EVD: 'Protéines isolées et autres produits protéiques',
  A046L:
    'Ingrédients isolés, additifs, arômes, adjuvants de cuisson et de fabrication majeurs',
  A0EVE:
    "Ingrédients pour la fortification/l'enrichissement des aliments et compléments",
  A0BXY: 'Ingrédients microbiologiques ou enzymatiques',
  A16PP: 'Autres ingrédients comestibles à base produits animaux et végétaux',
};
