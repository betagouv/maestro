import {
  countBy,
  groupBy,
  isEqual,
  keyBy,
  minBy,
  sortBy,
  uniq
} from 'lodash-es';
import type { FieldInheritance } from 'maestro-shared/schema/SpecificData/FieldInheritance';
import type { FieldInputType } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type { ActeDescriptorRow, SigalWorkbook } from './sigalWorkbook';

export const ImportedActes = ['PR17_2026_PALA_PALA', 'PR17_2026_PCHD_PDAOV'];

export const ExcludedDescriptors: Record<string, string> = {
  STNCFPSPC: 'Suivi après analyse',
  CMNT_CLTNCF: 'Suivi après analyse',
  DATCONTENV: 'Suivi après analyse',
  DATCONTCONF: 'Suivi après analyse',
  DTRCR: 'Suivi après analyse',
  CODBUD: 'Hors formulaire préleveur',
  REC_SPE: 'Hors formulaire préleveur',
  NUMSCELLE: 'Équivalent natif dans Maestro (scellé)',
  DTENVPREL: 'Équivalent natif dans Maestro (date d’envoi)',
  CMNT: 'Équivalent natif dans Maestro (notes)',
  ETATEORG: 'Type d’identifiant sans l’identifiant, à voir avec le métier'
};

type ValueMatch = 'sachaValueSigle' | Record<string, string>;

export const ReusedDescriptors: Record<
  string,
  { fieldKey: string; valueMatch: ValueMatch }
> = {
  SEX1: { fieldKey: 'sex', valueMatch: 'sachaValueSigle' },
  TAXOEF: { fieldKey: 'animalKind', valueMatch: 'sachaValueSigle' },
  ESPPVO: { fieldKey: 'species', valueMatch: 'sachaValueSigle' },
  TYPPROD: {
    fieldKey: 'productionKind',
    valueMatch: {
      VIAND: 'PROD_1',
      LAIT: 'PROD_2',
      BOUCH: 'PROD_4',
      INDTM: 'PROD_3'
    }
  },
  AG: { fieldKey: 'ageInMonths', valueMatch: {} },
  STDPRLDV: {
    fieldKey: 'stage',
    valueMatch: { COM_DET: 'STADE15', COM_GR: 'STADE16' }
  }
};

export const SubPlanCodeAliases: Record<string, string> = { '937 PS': '937' };

const InputTypes: Record<string, FieldInputType> = {
  Texte: 'text',
  Date: 'date',
  Entier: 'number',
  Numérique: 'decimal',
  'Liste à choix unique': 'select',
  'Liste à choix multiple': 'multiselect'
};

const OptionInputTypes: FieldInputType[] = ['select', 'multiselect'];

const ValidValueStatuses = ['Validée', 'Active'];

export type MaestroOption = {
  value: string;
  label: string;
  order: number;
  sachaCommemoratifValueSigle: string | null;
};

export type MaestroField = {
  key: string;
  sachaInDai: boolean;
  options: MaestroOption[];
};

export type MaestroSubPlan = {
  subPlanNumber: string;
  programmingPlanId: string;
  programmingPlanTitle: string;
  sachaContextSigle: string | null;
};

export type FieldSetting = {
  required: boolean;
  optionValues: string[];
};

export type MaestroSubPlanField = FieldSetting & {
  subPlanNumber: string;
  fieldKey: string;
  inheritance: FieldInheritance;
};

export type MaestroState = {
  subPlans: MaestroSubPlan[];
  fields: MaestroField[];
  planFields: { programmingPlanId: string; fieldKey: string }[];
  subPlanFields: MaestroSubPlanField[];
};

export type NewField = {
  key: string;
  inputType: FieldInputType;
  label: string;
  sachaCommemoratifSigle: string | null;
  sachaInDai: boolean;
};

export type NewOption = {
  fieldKey: string;
  value: string;
  label: string;
  order: number;
  sachaCommemoratifValueSigle: string | null;
};

export type PlacedField = FieldSetting & {
  fieldKey: string;
  order: number;
};

export type PlanFieldsPlacement = {
  programmingPlanTitle: string;
  subPlanNumber: string;
  fields: PlacedField[];
};

export type SubPlanFieldsPlacement = {
  acte: string;
  subPlanNumbers: string[];
  fields: PlacedField[];
};

export type SubPlanFieldReplacement = {
  subPlanNumber: string;
  fieldKey: string;
  previous: FieldSetting;
  next: FieldSetting;
};

export type DescriptorImportReport = {
  excluded: {
    sigle: string;
    label: string;
    reason: string;
    acteCount: number;
  }[];
  reused: {
    sigle: string;
    label: string;
    fieldKey: string;
    addedValues: number;
  }[];
  merged: {
    fieldKey: string;
    label: string;
    inputType: FieldInputType;
    sigles: string[];
  }[];
  textFallbacks: { sigle: string; label: string; acteCount: number }[];
  ignoredValues: {
    sigle: string;
    value: string;
    label: string;
    status: string;
  }[];
  labelConflicts: { fieldKey: string; value: string; labels: string[] }[];
  unknownSubPlans: { acte: string; code: string }[];
  plansWithUnmappedSubPlans: {
    programmingPlanTitle: string;
    subPlanNumbers: string[];
  }[];
};

export type DescriptorImport = {
  fields: NewField[];
  options: NewOption[];
  planFields: PlanFieldsPlacement[];
  subPlanFields: SubPlanFieldsPlacement[];
  subPlanFieldReplacements: SubPlanFieldReplacement[];
  report: DescriptorImportReport;
};

type FieldDefinition = {
  key: string;
  inputType: FieldInputType;
  label: string;
  standardized: boolean;
  sigles: string[];
};

type ActeField = Omit<PlacedField, 'order'> & { position: number };

const mostUsedSigle = (sigles: string[], links: ActeDescriptorRow[]) => {
  const counts = countBy(links, 'sigle');
  return sortBy(sigles, [
    (sigle) => -(counts[sigle] ?? 0),
    (sigle) => sigle
  ])[0];
};

const normalizedLabel = (label: string) =>
  label.toLowerCase().replace(/\s+/g, ' ').trim();

const sameFieldSetting = (a: FieldSetting, b: FieldSetting) =>
  a.required === b.required &&
  isEqual(sortBy(a.optionValues), sortBy(b.optionValues));

export const computeDescriptorImport = (
  workbook: SigalWorkbook,
  maestro: MaestroState
): DescriptorImport => {
  const descriptorsBySigle = keyBy(workbook.descriptors, 'sigle');
  const labelOf = (sigle: string) => descriptorsBySigle[sigle]?.label ?? sigle;
  const maestroFieldsByKey = keyBy(maestro.fields, 'key');

  const sampledLinks = workbook.acteDescriptors.filter(
    ({ received }) => !received
  );
  const links = sampledLinks.filter(
    ({ sigle }) => ExcludedDescriptors[sigle] === undefined
  );

  const validValues = groupBy(
    workbook.descriptorValues.filter(({ status }) =>
      ValidValueStatuses.includes(status)
    ),
    'sigle'
  );
  const linkedSigles = uniq(links.map(({ sigle }) => sigle));
  const ignoredValues = workbook.descriptorValues.filter(
    ({ sigle, status }) =>
      linkedSigles.includes(sigle) && !ValidValueStatuses.includes(status)
  );

  const textFallbacks: DescriptorImportReport['textFallbacks'] = [];
  const definitions = new Map<string, FieldDefinition>();
  const fieldKeyBySigle: Record<string, string> = {};

  for (const sigle of linkedSigles) {
    const reused = ReusedDescriptors[sigle];
    if (reused) {
      fieldKeyBySigle[sigle] = reused.fieldKey;
      continue;
    }
    const sigleLinks = links.filter((link) => link.sigle === sigle);
    const sigalInputType = InputTypes[sigleLinks[0].inputType];
    if (!sigalInputType) {
      throw new Error(
        `Type SIGAL inconnu pour ${sigle} : ${sigleLinks[0].inputType}`
      );
    }
    const inputType =
      OptionInputTypes.includes(sigalInputType) &&
      (validValues[sigle] ?? []).length === 0
        ? 'text'
        : sigalInputType;
    if (inputType !== sigalInputType) {
      textFallbacks.push({
        sigle,
        label: labelOf(sigle),
        acteCount: uniq(sigleLinks.map(({ acte }) => acte)).length
      });
    }
    const standardized = descriptorsBySigle[sigle]?.standardized ?? false;
    const groupKey = standardized
      ? `edi|${sigle}`
      : `${labelOf(sigle)}|${inputType}`;
    const definition = definitions.get(groupKey) ?? {
      key: sigle,
      inputType,
      label: labelOf(sigle),
      standardized,
      sigles: []
    };
    definition.sigles.push(sigle);
    definitions.set(groupKey, definition);
  }

  const compatibleValues = (sigle: string, other: string) =>
    (validValues[sigle] ?? []).every((value) =>
      (validValues[other] ?? []).every(
        (otherValue) =>
          otherValue.value !== value.value ||
          normalizedLabel(otherValue.label) === normalizedLabel(value.label)
      )
    );

  const fieldDefinitions = [...definitions.values()].flatMap((definition) => {
    const subgroups: FieldDefinition[] = [];
    for (const sigle of sortBy(definition.sigles, [
      (sigle) => -links.filter((link) => link.sigle === sigle).length,
      (sigle) => sigle
    ])) {
      const subgroup = subgroups.find(({ sigles }) =>
        sigles.every((other) => compatibleValues(sigle, other))
      );
      if (subgroup) {
        subgroup.sigles.push(sigle);
      } else {
        subgroups.push({ ...definition, sigles: [sigle] });
      }
    }
    return subgroups.map((subgroup) => {
      const key = mostUsedSigle(subgroup.sigles, links);
      return {
        ...subgroup,
        key,
        sigles: sortBy(subgroup.sigles, (sigle) => (sigle === key ? '' : sigle))
      };
    });
  });
  for (const definition of fieldDefinitions) {
    for (const sigle of definition.sigles) {
      fieldKeyBySigle[sigle] = definition.key;
    }
  }

  const options: NewOption[] = [];
  const labelConflicts: DescriptorImportReport['labelConflicts'] = [];
  const valueMapping: Record<string, Record<string, string>> = {};

  for (const definition of fieldDefinitions) {
    if (!OptionInputTypes.includes(definition.inputType)) {
      continue;
    }
    const fieldOptions: NewOption[] = [];
    for (const sigle of definition.sigles) {
      valueMapping[sigle] = {};
      for (const { value, label } of validValues[sigle] ?? []) {
        valueMapping[sigle][value] = value;
        const existing = fieldOptions.find((option) => option.value === value);
        if (existing) {
          if (existing.label !== label) {
            labelConflicts.push({
              fieldKey: definition.key,
              value,
              labels: [existing.label, label]
            });
          }
          continue;
        }
        fieldOptions.push({
          fieldKey: definition.key,
          value,
          label,
          order: fieldOptions.length + 1,
          sachaCommemoratifValueSigle: definition.standardized ? value : null
        });
      }
    }
    options.push(...fieldOptions);
  }

  const reused: DescriptorImportReport['reused'] = [];
  for (const sigle of linkedSigles) {
    const reuse = ReusedDescriptors[sigle];
    if (!reuse) {
      continue;
    }
    const field = maestroFieldsByKey[reuse.fieldKey];
    if (!field) {
      throw new Error(
        `Champ Maestro ${reuse.fieldKey} introuvable pour ${sigle}`
      );
    }
    valueMapping[sigle] = {};
    let addedValues = 0;
    let nextOrder = Math.max(0, ...field.options.map(({ order }) => order));
    for (const { value, label } of validValues[sigle] ?? []) {
      const matched = field.options.find((option) =>
        reuse.valueMatch === 'sachaValueSigle'
          ? option.sachaCommemoratifValueSigle === value
          : option.value === reuse.valueMatch[value]
      );
      if (matched) {
        valueMapping[sigle][value] = matched.value;
        continue;
      }
      nextOrder += 1;
      addedValues += 1;
      valueMapping[sigle][value] = value;
      options.push({
        fieldKey: reuse.fieldKey,
        value,
        label,
        order: nextOrder,
        sachaCommemoratifValueSigle:
          reuse.valueMatch === 'sachaValueSigle' ? value : null
      });
    }
    reused.push({
      sigle,
      label: labelOf(sigle),
      fieldKey: reuse.fieldKey,
      addedValues
    });
  }

  const acteFields: Record<string, ActeField[]> = {};
  for (const [acte, acteLinks] of Object.entries(groupBy(links, 'acte'))) {
    acteFields[acte] = acteLinks.map((link, position) => ({
      fieldKey: fieldKeyBySigle[link.sigle],
      required: link.required,
      optionValues: Object.values(valueMapping[link.sigle] ?? {}),
      position
    }));
    const duplicate = acteFields[acte].find(
      (field, index) =>
        acteFields[acte].findIndex(
          ({ fieldKey }) => fieldKey === field.fieldKey
        ) !== index
    );
    if (duplicate) {
      throw new Error(
        `L’acte ${acte} demande deux fois le champ ${duplicate.fieldKey}`
      );
    }
  }

  const maestroSubPlansByNumber = keyBy(maestro.subPlans, 'subPlanNumber');
  const unknownSubPlans: DescriptorImportReport['unknownSubPlans'] = [];
  const acteBySubPlanNumber: Record<string, string> = {};
  for (const { acte, code } of workbook.subPlans) {
    const subPlanNumber = SubPlanCodeAliases[code] ?? code;
    if (maestroSubPlansByNumber[subPlanNumber]) {
      acteBySubPlanNumber[subPlanNumber] = acte;
    } else if (!unknownSubPlans.some((unknown) => unknown.code === code)) {
      unknownSubPlans.push({ acte, code });
    }
  }

  const planFields: PlanFieldsPlacement[] = [];
  const subPlanFields: SubPlanFieldsPlacement[] = [];
  const subPlanFieldReplacements: SubPlanFieldReplacement[] = [];
  const reusedFieldKeys = Object.values(ReusedDescriptors).map(
    ({ fieldKey }) => fieldKey
  );
  const plansWithUnmappedSubPlans: DescriptorImportReport['plansWithUnmappedSubPlans'] =
    [];

  const subPlansByPlan = groupBy(
    sortBy(maestro.subPlans, 'subPlanNumber'),
    'programmingPlanId'
  );
  for (const planSubPlans of Object.values(subPlansByPlan)) {
    const mapped = planSubPlans.filter(
      ({ subPlanNumber }) => acteBySubPlanNumber[subPlanNumber]
    );
    if (mapped.length === 0) {
      continue;
    }
    const { programmingPlanId, programmingPlanTitle } = planSubPlans[0];
    const unmapped = planSubPlans.filter(
      ({ subPlanNumber }) => !acteBySubPlanNumber[subPlanNumber]
    );
    if (unmapped.length > 0) {
      plansWithUnmappedSubPlans.push({
        programmingPlanTitle,
        subPlanNumbers: unmapped.map(({ subPlanNumber }) => subPlanNumber)
      });
    }
    const subPlanNumbersByActe = groupBy(
      mapped.map(({ subPlanNumber }) => subPlanNumber),
      (subPlanNumber) => acteBySubPlanNumber[subPlanNumber]
    );
    const actes = Object.keys(subPlanNumbersByActe).sort();

    const commonFields =
      unmapped.length > 0
        ? []
        : (acteFields[actes[0]] ?? []).filter((field) =>
            actes.every((acte) =>
              (acteFields[acte] ?? []).some(
                (other) =>
                  other.fieldKey === field.fieldKey &&
                  sameFieldSetting(field, other)
              )
            )
          );
    const commonKeys = commonFields.map(({ fieldKey }) => fieldKey);

    const planPlaced = sortBy(commonFields, [
      (field) =>
        minBy(
          actes.flatMap((acte) =>
            (acteFields[acte] ?? []).filter(
              ({ fieldKey }) => fieldKey === field.fieldKey
            )
          ),
          'position'
        )?.position ?? 0,
      'fieldKey'
    ])
      .map(({ position: _position, ...field }, index) => ({
        ...field,
        order: index + 1
      }))
      .filter(
        ({ fieldKey }) =>
          !maestro.planFields.some(
            (existing) =>
              existing.programmingPlanId === programmingPlanId &&
              existing.fieldKey === fieldKey
          )
      );
    if (planPlaced.length > 0) {
      planFields.push({
        programmingPlanTitle,
        subPlanNumber: mapped[0].subPlanNumber,
        fields: planPlaced
      });
    }

    for (const acte of actes) {
      const subPlanNumbers = subPlanNumbersByActe[acte];
      const ownFields = (acteFields[acte] ?? [])
        .filter(({ fieldKey }) => !commonKeys.includes(fieldKey))
        .map(({ position: _position, ...field }, index) => ({
          ...field,
          order: index + 1
        }));
      const ownPlaced = ownFields.filter(
        ({ fieldKey }) =>
          !subPlanNumbers.every((subPlanNumber) =>
            maestro.subPlanFields.some(
              (existing) =>
                existing.subPlanNumber === subPlanNumber &&
                existing.fieldKey === fieldKey
            )
          )
      );
      if (ownPlaced.length > 0) {
        subPlanFields.push({ acte, subPlanNumbers, fields: ownPlaced });
      }

      for (const field of ownFields.filter(({ fieldKey }) =>
        reusedFieldKeys.includes(fieldKey)
      )) {
        for (const subPlanNumber of subPlanNumbers) {
          const existing = maestro.subPlanFields.find(
            (subPlanField) =>
              subPlanField.subPlanNumber === subPlanNumber &&
              subPlanField.fieldKey === field.fieldKey &&
              subPlanField.inheritance === 'Own'
          );
          if (existing && !sameFieldSetting(existing, field)) {
            subPlanFieldReplacements.push({
              subPlanNumber,
              fieldKey: field.fieldKey,
              previous: {
                required: existing.required,
                optionValues: existing.optionValues
              },
              next: {
                required: field.required,
                optionValues: field.optionValues
              }
            });
          }
        }
      }
    }
  }

  const existingOptionKeys = new Set(
    maestro.fields.flatMap(({ key, options: fieldOptions }) =>
      fieldOptions.map(({ value }) => `${key}|${value}`)
    )
  );

  const excludedSigles = uniq(
    sampledLinks
      .map(({ sigle }) => sigle)
      .filter((sigle) => ExcludedDescriptors[sigle] !== undefined)
  );

  return {
    fields: fieldDefinitions
      .filter(({ key }) => !maestroFieldsByKey[key])
      .map(({ key, inputType, label, standardized }) => ({
        key,
        inputType,
        label,
        sachaCommemoratifSigle: standardized ? key : null,
        sachaInDai: standardized
      })),
    options: options.filter(
      ({ fieldKey, value }) => !existingOptionKeys.has(`${fieldKey}|${value}`)
    ),
    planFields,
    subPlanFields,
    subPlanFieldReplacements,
    report: {
      excluded: excludedSigles.map((sigle) => ({
        sigle,
        label: labelOf(sigle),
        reason: ExcludedDescriptors[sigle],
        acteCount: uniq(
          sampledLinks
            .filter((link) => link.sigle === sigle)
            .map(({ acte }) => acte)
        ).length
      })),
      reused,
      merged: fieldDefinitions
        .filter(({ sigles }) => sigles.length > 1)
        .map(({ key, label, inputType, sigles }) => ({
          fieldKey: key,
          label,
          inputType,
          sigles
        })),
      textFallbacks,
      ignoredValues: ignoredValues.map(({ sigle, value, label, status }) => ({
        sigle,
        value,
        label,
        status
      })),
      labelConflicts,
      unknownSubPlans,
      plansWithUnmappedSubPlans
    }
  };
};
