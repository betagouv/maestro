import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSearchInput from '../../components/_app/AppSearchInput/AppSearchInput';
import { ApiClientContext } from '../../services/apiClient';
import { canHaveValue, getAttributeExpectedValues } from './sachaUtils';

type Props = {
  attribute: SampleMatrixSpecificDataKeys;
  sachaCommemoratifs: SachaCommemoratifRecord;
  sampleSpecifiDataRecord: SampleSpecificDataRecord;
};

export const CommemoratifSigleForm = ({
  attribute,
  sachaCommemoratifs,
  sampleSpecifiDataRecord,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const [updateSampleSpecificDataAttribute] =
    apiClient.useUpdateSampleSpecificDataAttributeMutation();
  const [updateSampleSpecificDataAttributeValue] =
    apiClient.useUpdateSampleSpecificDataAttributeValueMutation();
  const inputConf = MatrixSpecificDataFormInputs[attribute];

  const attributeConfInDb = sampleSpecifiDataRecord[attribute as string];

  const [inDai, setInDai] = useState<boolean>(
    attributeConfInDb?.inDai ?? false
  );
  const [selectedSigle, setSelectedSigle] = useState<CommemoratifSigle | null>(
    attributeConfInDb?.sachaCommemoratifSigle ?? null
  );
  const [selectedValues, setSelectedValues] = useState<
    Record<string, CommemoratifValueSigle>
  >(attributeConfInDb?.values ?? {});

  const onSelectSigle = (sachaCommemoratifSigle?: CommemoratifSigle) => {
    if (sachaCommemoratifSigle) {
      updateSampleSpecificDataAttribute({
        attribute,
        sachaCommemoratifSigle,
        inDai
      });
    }
    setSelectedSigle(sachaCommemoratifSigle ?? null);
    setSelectedValues({});
  };

  const onToggleInDai = (newInDai: boolean) => {
    setInDai(newInDai);
    if (selectedSigle && newInDai) {
      updateSampleSpecificDataAttribute({
        attribute,
        sachaCommemoratifSigle: selectedSigle,
        inDai: true
      });
    }
  };

  const onSelectValue = (
    attributeValue: string,
    sachaCommemoratifValueSigle?: CommemoratifValueSigle
  ) => {
    if (sachaCommemoratifValueSigle?.length) {
      updateSampleSpecificDataAttributeValue({
        attribute,
        attributeValue,
        sachaCommemoratifValueSigle
      });

      setSelectedValues((prev) => ({
        ...prev,
        [attributeValue]: sachaCommemoratifValueSigle
      }));
    }
  };

  const options = Object.values(sachaCommemoratifs)
    .map((c) => ({
      label: `${c.libelle} (${c.sigle})`,
      value: c.sigle
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const attributeCanHaveValue = canHaveValue(inputConf);
  const optionsValues = getAttributeExpectedValues(attribute);

  return (
    <div className={clsx('border', cx('fr-p-4w'))}>
      <div className={clsx('d-flex-row')}>
        <div className={clsx('d-flex-column', 'd-flex-align-start')}>
          <h6 className={cx()}>{inputConf.label}</h6>
          <ToggleSwitch
            label={'Inclure dans la DAI ?'}
            checked={inDai}
            labelPosition={'left'}
            onChange={() => {
              onToggleInDai(!inDai);
            }}
          />
        </div>
        {inDai && (
          <AppSearchInput
            label={'Sigle Sacha'}
            options={options}
            value={selectedSigle ?? ''}
            onSelect={(value) => onSelectSigle(value as CommemoratifSigle)}
            placeholder="Rechercher un sigle"
            className={clsx(cx('fr-ml-auto', 'fr-mb-0'))}
          />
        )}
      </div>
      {inDai && selectedSigle !== null && attributeCanHaveValue && (
        <>
          <hr className={cx('fr-my-2w')} />
          <div className={cx('fr-text--lg')}>
            Association des valeurs possibles
          </div>
          <div
            className={clsx('d-flex-row')}
            style={{ gap: '2rem', flexWrap: 'wrap' }}
          >
            {optionsValues.map((optionValue) => (
              <OptionValueLine
                key={optionValue}
                optionValue={optionValue}
                inputConf={inputConf}
                selectedCommemoratif={sachaCommemoratifs[selectedSigle]}
                selectedValue={selectedValues[optionValue] ?? ''}
                onSelectValue={(v) =>
                  onSelectValue(optionValue, v as CommemoratifValueSigle)
                }
              />
            ))}
          </div>
        </>
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
  const optionLabel = canHaveValue(inputConf)
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
