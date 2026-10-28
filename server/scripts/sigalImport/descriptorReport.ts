import type { ContextSigleImport } from './contextSigleImport';
import {
  type DescriptorImport,
  type FieldSetting,
  ImportedActes
} from './descriptorImport';

const table = (headers: string[], rows: (string | number)[][]) =>
  rows.length === 0
    ? '_Aucun._\n'
    : `${[
        `| ${headers.join(' | ')} |`,
        `|${headers.map(() => '---').join('|')}|`,
        ...rows.map((row) => `| ${row.join(' | ')} |`)
      ].join('\n')}\n`;

const fieldSettingLabel = ({ required, optionValues }: FieldSetting) =>
  `${required ? 'obligatoire' : 'facultatif'}, ${optionValues.map((value) => `\`${value}\``).join(', ')}`;

export const renderDescriptorReport = (
  {
    fields,
    options,
    planFields,
    subPlanFields,
    subPlanFieldReplacements,
    report
  }: DescriptorImport,
  contextSigleImport: ContextSigleImport,
  sourceFile: string
): string =>
  [
    '# Import des descripteurs de prélèvement SIGAL — rapport',
    '',
    `Source : \`${sourceFile}\`.`,
    '',
    `Descripteurs importés pour ${ImportedActes.join(' et ')} seulement ; les autres actes sont reportés à la campagne 2027.`,
    '',
    '## Opérations',
    '',
    table(
      ['Opération', 'Nombre'],
      [
        ['Nouveaux champs', fields.length],
        ['Nouvelles options', options.length],
        ['Plans recevant des champs', planFields.length],
        [
          'Champs de plan',
          planFields.reduce((sum, { fields: placed }) => sum + placed.length, 0)
        ],
        [
          'Champs propres de sous-plans (par acte)',
          subPlanFields.reduce(
            (sum, { fields: placed }) => sum + placed.length,
            0
          )
        ],
        [
          'Sous-plans recevant des champs propres',
          new Set(subPlanFields.flatMap(({ subPlanNumbers }) => subPlanNumbers))
            .size
        ],
        [
          'Paramétrages de sous-plan remplacés',
          subPlanFieldReplacements.length
        ],
        [
          'Contextes d’intervention SIGAL renseignés',
          contextSigleImport.updates.length
        ]
      ]
    ),
    '## Contextes d’intervention SIGAL déjà renseignés avec un autre acte (non modifiés)',
    '',
    table(
      ['Sous-plan', 'Contexte Maestro', 'Acte SIGAL'],
      contextSigleImport.conflicts.map(
        ({ subPlanNumber, currentSachaContextSigle, sachaContextSigle }) => [
          subPlanNumber,
          `\`${currentSachaContextSigle}\``,
          `\`${sachaContextSigle}\``
        ]
      )
    ),
    '## Descripteurs exclus',
    '',
    table(
      ['Libellé', 'Sigle', 'Motif', 'Actes'],
      report.excluded.map(({ label, sigle, reason, acteCount }) => [
        label,
        `\`${sigle}\``,
        reason,
        acteCount
      ])
    ),
    '## Champs Maestro réutilisés',
    '',
    table(
      ['Libellé SIGAL', 'Sigle', 'Champ Maestro', 'Valeurs SIGAL ajoutées'],
      report.reused.map(({ label, sigle, fieldKey, addedValues }) => [
        label,
        `\`${sigle}\``,
        `\`${fieldKey}\``,
        addedValues
      ])
    ),
    '## Paramétrages de sous-plan remplacés par celui de SIGAL',
    '',
    table(
      ['Sous-plan', 'Champ', 'Avant', 'Après'],
      subPlanFieldReplacements.map(
        ({ subPlanNumber, fieldKey, previous, next }) => [
          subPlanNumber,
          `\`${fieldKey}\``,
          fieldSettingLabel(previous),
          fieldSettingLabel(next)
        ]
      )
    ),
    '## Descripteurs fusionnés (même libellé, même type, hors EDI)',
    '',
    table(
      ['Libellé', 'Type', 'Champ', 'Sigles'],
      report.merged.map(({ label, inputType, fieldKey, sigles }) => [
        label,
        inputType,
        `\`${fieldKey}\``,
        sigles.map((sigle) => `\`${sigle}\``).join(', ')
      ])
    ),
    '## Listes sans valeur connue, importées en texte libre',
    '',
    table(
      ['Libellé', 'Sigle', 'Actes'],
      report.textFallbacks.map(({ label, sigle, acteCount }) => [
        label,
        `\`${sigle}\``,
        acteCount
      ])
    ),
    '## Valeurs ignorées (gelées ou archivées)',
    '',
    table(
      ['Sigle', 'Valeur', 'Libellé', 'Statut'],
      report.ignoredValues.map(({ sigle, value, label, status }) => [
        `\`${sigle}\``,
        `\`${value}\``,
        label,
        status
      ])
    ),
    '## Valeurs de même code et de libellés différents (premier libellé gardé)',
    '',
    table(
      ['Champ', 'Valeur', 'Libellés'],
      report.labelConflicts.map(({ fieldKey, value, labels }) => [
        `\`${fieldKey}\``,
        `\`${value}\``,
        labels.join(' / ')
      ])
    ),
    '## Sous-plans SIGAL absents de Maestro',
    '',
    table(
      ['Acte', 'Code'],
      report.unknownSubPlans.map(({ acte, code }) => [acte, code])
    ),
    '## Plans Maestro avec des sous-plans hors SIGAL (aucun champ de plan, tout en propre)',
    '',
    table(
      ['Plan', 'Sous-plans hors SIGAL'],
      report.plansWithUnmappedSubPlans.map(
        ({ programmingPlanTitle, subPlanNumbers }) => [
          programmingPlanTitle,
          subPlanNumbers.join(', ')
        ]
      )
    ),
    ''
  ].join('\n');
