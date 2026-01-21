import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

interface ReferenceCommemoratif {
  Cle: string;
  Sigle: string;
  Libelle: string;
  Statut: string;
  TypeDonnee?: string;
  Unite?: string;
}

interface ReferenceCommemoratifsValeurs {
  Cle: string;
  Sigle: string;
  Libelle: string;
  Statut: string;
}

interface ReferenceCommemoratifType {
  ReferenceCommemoratif: ReferenceCommemoratif;
  ReferenceCommemoratifsValeurs: ReferenceCommemoratifsValeurs[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const xmlPath = join(__dirname, '../../sacha/donneesStandardisees.xml');
const outputPath = join(__dirname, 'reference_commemoratif_types.json');

const xmlContent = readFileSync(xmlPath, 'utf-8');

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (name) =>
    name === 'ReferenceCommemoratifType' ||
    name === 'ReferenceCommemoratifsValeurs'
});

const parsed = parser.parse(xmlContent);

const referenceCommemoratifTypes: ReferenceCommemoratifType[] =
  parsed.DonneesStandardisees.ReferenceCommemoratifType ?? [];

interface SachaCommemoratifValue {
  cle: string;
  sigle: string;
  libelle: string;
  statut: string;
}

interface SachaCommemoratif {
  cle: string;
  sigle: string;
  libelle: string;
  statut: string;
  typeDonnee: string | null;
  unite: string | null;
  values: SachaCommemoratifValue[];
}

const results: SachaCommemoratif[] = referenceCommemoratifTypes.map((item) => ({
  cle: item.ReferenceCommemoratif.Cle,
  sigle: item.ReferenceCommemoratif.Sigle,
  libelle: item.ReferenceCommemoratif.Libelle,
  statut: item.ReferenceCommemoratif.Statut,
  typeDonnee: item.ReferenceCommemoratif.TypeDonnee ?? null,
  unite: item.ReferenceCommemoratif.Unite ?? null,

  values: (item.ReferenceCommemoratifsValeurs ?? []).map((valeur) => ({
    cle: valeur.Cle,
    sigle: valeur.Sigle,
    libelle: valeur.Libelle,
    statut: valeur.Statut
  }))
}));

writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

console.log('Done');
