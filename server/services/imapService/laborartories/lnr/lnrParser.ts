import {
  type MaestroDate,
  maestroDateRefined
} from 'maestro-shared/utils/date';
import { ExtractError } from '../../extractError';
import type { ExportAnalysis, ExportDataSubstance } from '../../index';
import { frenchNumberStringValidator, parseSampleReference } from '../../utils';

const TABLE_HEADER = 'quantification Incertitude LMR';
const TABLE_FOOTERS = [
  "Les résultats de ce rapport d'analyses",
  'Observation(s)'
];

const EXPECTED_UNIT = 'mg/kg de produit';
const EXPECTED_UNCERTAINTY = 50;

const toLines = (text: string): string[] =>
  text.split('\n').map((line) => line.replace(/\s+/g, ' ').trim());

const readField = (lines: string[], label: string): string | null => {
  // Le : n'est pas toujours précédé d'un espace
  const line = lines.find(
    (l) => l.startsWith(`${label} :`) || l.startsWith(`${label}:`)
  );
  return line ? line.slice(line.indexOf(':') + 1).trim() : null;
};

const requireField = (lines: string[], label: string): string => {
  const value = readField(lines, label);
  if (value === null) {
    throw new ExtractError(
      `Champ « ${label} » introuvable dans le rapport LNR`
    );
  }
  return value;
};

// Les deux formats coexistent, parfois dans un même rapport
const parseFrenchDate = (value: string, label: string): MaestroDate => {
  const [day, month, year] = value.split('/');
  const fullYear = year?.length === 2 ? `20${year}` : year;
  const parsed = maestroDateRefined.safeParse(`${fullYear}-${month}-${day}`);

  if (!parsed.success) {
    throw new ExtractError(`Date « ${label} » invalide : ${value}`);
  }
  return parsed.data;
};

const parseFrenchNumber = (value: string, label: string): number => {
  const parsed = frenchNumberStringValidator.safeParse(value);
  if (!parsed.success || parsed.data === null) {
    throw new ExtractError(`Nombre « ${label} » invalide : ${value}`);
  }
  return parsed.data;
};

const isNumber = (token: string | undefined): token is string =>
  token !== undefined && /^[\d.,]+$/.test(token);

/**
 * L'incertitude s'écrit « 50 % ». Le pourcentage permet de savoir que c'est une ligne de résultat, c'est le seul
 * endroit du rapport où il apparaît
 */
const takeUncertainty = (tokens: string[]): string | undefined => {
  const token = tokens.pop();
  if (token === '%') {
    return tokens.pop();
  }
  return token?.endsWith('%') ? token.slice(0, -1) : undefined;
};

/**
 * Seules les trois formes observées sont acceptées : « < LQ » (deux jetons, le
 * chevron en est un à part entière), « ND » et une valeur quantifiée.
 */
const takeResult = (tokens: string[]): string | undefined => {
  const last = tokens.pop();
  const isBelow = tokens.at(-1) === '<';

  if (last === 'LQ') {
    return isBelow ? `${tokens.pop()} ${last}` : undefined;
  }
  if (isBelow) {
    return undefined;
  }
  return last === 'ND' || isNumber(last) ? last : undefined;
};

type ResultRow = {
  label: string;
  result: string;
  lq: string;
  uncertainty: number;
  lmr: string;
};

const parseResultRow = (line: string): ResultRow | null => {
  const tokens = line.split(' ');

  const lmr = tokens.pop();
  const uncertainty = takeUncertainty(tokens);
  if (uncertainty === undefined || !isNumber(uncertainty)) {
    return null;
  }

  const lq = tokens.pop();
  // La LMR est vide (« - ») tant qu'aucun dépassement n'est mesuré
  if (!isNumber(lq) || (lmr !== '-' && !isNumber(lmr))) {
    return null;
  }

  const result = takeResult(tokens);
  if (result === undefined) {
    throw new ExtractError(
      `Résultat non reconnu dans la ligne « ${line} » du rapport LNR`
    );
  }

  return {
    label: tokens.join(' '),
    result,
    lq,
    uncertainty: Number(uncertainty),
    lmr
  };
};

/** Les lignes du tableau, en-têtes et pieds de page répétés retirés. */
const tableLines = (lines: string[]): string[] => {
  const tableRows: string[] = [];
  let insideTable = false;

  for (const line of lines) {
    if (line === TABLE_HEADER) {
      insideTable = true;
    } else if (TABLE_FOOTERS.some((footer) => line.startsWith(footer))) {
      insideTable = false;
    } else if (insideTable && line) {
      tableRows.push(line);
    }
  }
  return tableRows;
};

const toResidue = (
  row: ResultRow,
  common: Pick<
    ExportDataSubstance,
    | 'label'
    | 'casNumber'
    | 'codeSandre'
    | 'analysisMethod'
    | 'analysisDate'
    | 'lq'
    | 'preciseMethod'
  >
): ExportDataSubstance => {
  // « ND » comme « < LQ » : rien n'a été détecté au-dessus de la limite de
  // quantification. Aucune forme connue ne correspond à « NQ » à ce jour.
  if (row.result === 'ND' || row.result === '< LQ') {
    return { result_kind: 'ND', ...common };
  }
  return {
    result_kind: 'Q',
    result: parseFrenchNumber(row.result, `résultat de ${common.label}`),
    lmr:
      row.lmr === '-'
        ? null
        : parseFrenchNumber(row.lmr, `LMR de ${common.label}`),
    ...common
  };
};

const parseResidues = (
  lines: string[],
  analysisDate: MaestroDate,
  preciseMethod: string
): ExportDataSubstance[] => {
  const residues: ExportDataSubstance[] = [];
  let pendingLabel: string[] = [];

  for (const line of tableLines(lines)) {
    const row = parseResultRow(line);
    if (row === null) {
      pendingLabel.push(line);
      continue;
    }

    // Un libellé peut s'étaler sur plusieurs lignes
    const label = [...pendingLabel, row.label].join(' ').trim();
    pendingLabel = [];

    if (!label) {
      throw new ExtractError(`Résidu sans libellé dans la ligne « ${line} »`);
    }
    if (row.uncertainty !== EXPECTED_UNCERTAINTY) {
      throw new ExtractError(
        `Incertitude inattendue pour ${label} : ${row.uncertainty} % (attendu ${EXPECTED_UNCERTAINTY} %)`
      );
    }

    residues.push(
      toResidue(row, {
        label,
        casNumber: null,
        codeSandre: null,
        analysisMethod: 'Multi',
        analysisDate,
        lq: parseFrenchNumber(row.lq, `limite de quantification de ${label}`),
        preciseMethod
      })
    );
  }

  if (pendingLabel.length > 0) {
    throw new ExtractError(
      `Ligne(s) du tableau LNR sans résultat : ${pendingLabel.join(' / ')}`
    );
  }
  if (residues.length === 0) {
    throw new ExtractError(`Aucun résidu trouvé dans le rapport LNR`);
  }

  return residues;
};

export const parseLnrReport = (
  text: string
): Omit<ExportAnalysis, 'pdfFile'> => {
  const lines = toLines(text);

  const rawReference = requireField(lines, 'Référence Echantillon Client');
  const sampleReference = parseSampleReference(rawReference);
  if (!sampleReference) {
    throw new ExtractError(`Référence lnr invalide: ${rawReference}`);
  }

  const unit = requireField(lines, 'Unité de mesure');
  if (unit !== EXPECTED_UNIT) {
    throw new ExtractError(
      `Unité de mesure inattendue : ${unit} (attendu ${EXPECTED_UNIT})`
    );
  }

  const analysisDate = parseFrenchDate(
    requireField(lines, "Date de début d'analyse"),
    "Date de début d'analyse"
  );
  const receiptDate = parseFrenchDate(
    requireField(lines, 'Date de Réception des Echantillons'),
    'Date de Réception des Echantillons'
  );

  return {
    sampleReference: sampleReference.reference,
    itemNumber: sampleReference.itemNumber,
    copyNumber: sampleReference.copyNumber,
    receiptDate,
    notes: readField(lines, 'Observation(s)') ?? '',
    residues: parseResidues(
      lines,
      analysisDate,
      requireField(lines, "Méthode d'analyse")
    )
  };
};
