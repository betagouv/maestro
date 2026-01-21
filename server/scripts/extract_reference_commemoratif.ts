import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratif
} from 'maestro-shared/schema/Commemoratif/CommemoratifSigle';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initKysely } from '../repositories/kysely';
import { sachaCommemoratifRepository } from '../repositories/sachaCommemoratifRepository';
import config from '../utils/config';

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

const results: SachaCommemoratif[] = referenceCommemoratifTypes.map((item) => ({
  cle: item.ReferenceCommemoratif.Cle,
  sigle: item.ReferenceCommemoratif.Sigle as CommemoratifSigle,
  libelle: item.ReferenceCommemoratif.Libelle,
  statut: item.ReferenceCommemoratif.Statut,
  typeDonnee: item.ReferenceCommemoratif.TypeDonnee ?? null,
  unite: item.ReferenceCommemoratif.Unite ?? null,

  values: (item.ReferenceCommemoratifsValeurs ?? []).map((valeur) => ({
    cle: valeur.Cle,
    sigle: valeur.Sigle as CommemoratifValueSigle,
    libelle: valeur.Libelle,
    statut: valeur.Statut
  }))
}));

initKysely(config.databaseUrl);
await sachaCommemoratifRepository.upsertAll(results);
