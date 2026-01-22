import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { uniq } from 'lodash-es';
import {
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  CommemoratifSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { getSampleMatrixSpecificDataAttributeValues } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSearchInput from '../../components/_app/AppSearchInput/AppSearchInput';

type Props = {
  attribute: SampleMatrixSpecificDataKeys;
  sachaCommemoratifs: SachaCommemoratifRecord;
  programmingPlanSpecifiDataRecord: SampleSpecificDataRecord;
};

export const CommemoratifSigleForm = ({
  attribute,
  sachaCommemoratifs,
  programmingPlanSpecifiDataRecord,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const inputConf = MatrixSpecificDataFormInputs[attribute];

  const attributeConfInDb =
    programmingPlanSpecifiDataRecord[attribute as string];

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
  const optionsValues = uniq(
    ProgrammingPlanKindWithSacha.options.flatMap((p) =>
      getSampleMatrixSpecificDataAttributeValues(p, attribute)
    )
  );

  return (
    <div>
      <AppSearchInput
        label={inputConf.label}
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
          {optionsValues.map((optionValue) => (
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
