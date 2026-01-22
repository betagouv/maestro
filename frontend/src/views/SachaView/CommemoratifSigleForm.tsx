import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  MatrixSpecificDataForm,
  ProgrammingPlanKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataForm';
import {
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanSpecificDataRecord } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSpecificDataAttribute';
import {
  CommemoratifSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSearchInput from '../../components/_app/AppSearchInput/AppSearchInput';

type Props<P extends Exclude<ProgrammingPlanKind, 'PPV'>> = {
  attribute: ProgrammingPlanKeys<P>;
  programmingPlanKind: P;
  sachaCommemoratifs: SachaCommemoratifRecord;
  programmingPlanSpecifiDataRecord: ProgrammingPlanSpecificDataRecord;
};

const getOptionsValues = (
  input: (typeof MatrixSpecificDataFormInputs)[keyof typeof MatrixSpecificDataFormInputs],
  programmingPlanKind: ProgrammingPlanKind
): string[] => {
  if (input.inputType !== 'select' && input.inputType !== 'radio') {
    return [];
  }
  const optionsValues = input.optionsValues;
  if (Array.isArray(optionsValues)) {
    return optionsValues;
  }
  return optionsValues[programmingPlanKind] ?? [];
};

export const CommemoratifSigleForm = <
  P extends Exclude<ProgrammingPlanKind, 'PPV'>
>({
  attribute,
  programmingPlanKind,
  sachaCommemoratifs,
  programmingPlanSpecifiDataRecord,
  ..._rest
}: Props<P>) => {
  assert<Equals<keyof typeof _rest, never>>();
  const attributeConf = MatrixSpecificDataForm[programmingPlanKind][attribute];
  const inputConf =
    MatrixSpecificDataFormInputs[attribute as SampleMatrixSpecificDataKeys];

  const attributeConfInDb =
    programmingPlanSpecifiDataRecord[programmingPlanKind].attributes[
      attribute as string
    ];

  const [selectedSigle, setSelectedSigle] = useState<string | null>(
    attributeConfInDb?.sachaCommemoratifSigle ?? null
  );
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    attributeConfInDb?.values ?? {}
  );

  const onSelectSigle = (sigle?: string) => {
    setSelectedSigle(sigle ?? null);
    setSelectedValues({});
  };

  const onSelectValue = (optionValue: string, valueSigle?: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [optionValue]: valueSigle ?? ''
    }));
  };

  const options = Object.values(sachaCommemoratifs)
    .map((c) => ({
      label: `${c.libelle} (${c.sigle})`,
      value: c.sigle
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const isSelectOrRadio =
    inputConf.inputType === 'select' || inputConf.inputType === 'radio';
  const optionValues = getOptionsValues(inputConf, programmingPlanKind);

  return (
    <div>
      <AppSearchInput
        label={attributeConf.label ?? inputConf.label}
        options={options}
        value={selectedSigle ?? ''}
        onSelect={onSelectSigle}
        placeholder="Rechercher un sigle"
      />
      {selectedSigle !== null && isSelectOrRadio && (
        <div
          className={clsx(
            'd-flex-column',
            'border',
            cx('fr-m-2w', 'fr-p-2w', 'fr-pl-4w')
          )}
        >
          {optionValues.map((optionValue) => (
            <OptionValueLine
              key={optionValue}
              optionValue={optionValue}
              inputConf={inputConf}
              selectedCommemoratif={
                sachaCommemoratifs[selectedSigle as CommemoratifSigle]
              }
              selectedValue={selectedValues[optionValue] ?? ''}
              onSelectValue={(v) => onSelectValue(optionValue, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
interface OptionValueLineProps {
  optionValue: string;
  inputConf: (typeof MatrixSpecificDataFormInputs)[SampleMatrixSpecificDataKeys];
  selectedCommemoratif: SachaCommemoratifRecord[CommemoratifSigle] | null;
  selectedValue: string | null;
  onSelectValue: (valueSigle?: string) => void;
}

const OptionValueLine = ({
  optionValue,
  inputConf,
  selectedCommemoratif,
  selectedValue,
  onSelectValue
}: OptionValueLineProps) => {
  const optionLabel =
    inputConf.inputType === 'select' || inputConf.inputType === 'radio'
      ? (inputConf.optionsLabels?.[optionValue] ?? optionValue)
      : optionValue;

  const valueOptions = selectedCommemoratif
    ? Object.values(selectedCommemoratif.values)
        .map((v) => ({
          label: `${v.libelle} (${v.sigle})`,
          value: v.sigle
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  return (
    <AppSearchInput
      key={optionValue}
      label={optionLabel}
      options={valueOptions}
      value={selectedValue ?? ''}
      onSelect={onSelectValue}
      placeholder="Rechercher une valeur"
      required={true}
      state={selectedValue ? 'default' : 'error'}
    />
  );
};
