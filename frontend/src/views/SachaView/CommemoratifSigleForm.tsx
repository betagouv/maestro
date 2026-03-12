import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppSearchInput from '../../components/_app/AppSearchInput/AppSearchInput';
import { ApiClientContext } from '../../services/apiClient';

type Props = {
  fieldConfig: SachaFieldConfig;
  sachaCommemoratifs: SachaCommemoratifRecord;
};

export const CommemoratifSigleForm = ({
  fieldConfig,
  sachaCommemoratifs,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const [updateSampleSpecificDataAttribute] =
    apiClient.useUpdateSampleSpecificDataAttributeMutation();
  const [updateSampleSpecificDataAttributeValue] =
    apiClient.useUpdateSampleSpecificDataAttributeValueMutation();
  const attribute = fieldConfig.key;

  const [inDai, setInDai] = useState<boolean>(fieldConfig.inDai);
  const [optional, setOptional] = useState<boolean>(fieldConfig.optional);
  const [selectedSigle, setSelectedSigle] = useState<CommemoratifSigle | null>(
    fieldConfig.sachaCommemoratifSigle as CommemoratifSigle | null
  );
  const [selectedValues, setSelectedValues] = useState<
    Record<string, CommemoratifValueSigle>
  >(
    Object.fromEntries(
      fieldConfig.options
        .filter((o) => o.sachaCommemoratifValueSigle !== null)
        .map((o) => [
          o.value,
          o.sachaCommemoratifValueSigle as CommemoratifValueSigle
        ])
    )
  );

  const onSelectSigle = (sachaCommemoratifSigle?: CommemoratifSigle) => {
    updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: sachaCommemoratifSigle ?? null,
      inDai,
      optional
    });
    setSelectedSigle(sachaCommemoratifSigle ?? null);
    setSelectedValues({});
  };

  const onToggleInDai = (newInDai: boolean) => {
    setInDai(newInDai);
    updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: selectedSigle,
      inDai: newInDai,
      optional
    });
  };
  const onToggleOptional = (newOptional: boolean) => {
    setOptional(newOptional);
    updateSampleSpecificDataAttribute({
      attribute,
      sachaCommemoratifSigle: selectedSigle,
      inDai,
      optional: newOptional
    });
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
    .filter((c) => {
      if (fieldConfig.inputType === 'number') {
        return c.typeDonnee === 'numeric';
      }
      if (
        fieldConfig.inputType === 'textarea' ||
        fieldConfig.inputType === 'text'
      ) {
        return c.typeDonnee === 'text';
      }
      if (
        fieldConfig.inputType === 'select' ||
        fieldConfig.inputType === 'radio'
      ) {
        return c.typeDonnee === 'list';
      }
      return false;
    })
    .map((c) => ({
      label: `${c.libelle} (${c.sigle})`,
      value: c.sigle
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const attributeCanHaveValue =
    fieldConfig.inputType === 'select' || fieldConfig.inputType === 'radio';
  const optionsValues = [...fieldConfig.options]
    .sort((a, b) => a.order - b.order)
    .map((o) => o.value);

  return (
    <div className={clsx('border', cx('fr-p-4w'))}>
      <div>
        <div className={clsx('d-flex-column', 'd-flex-align-start')}>
          <h6>{fieldConfig.label}</h6>
          <div
            className={clsx('d-flex-row', 'd-flex-align-center')}
            style={{ width: '100%' }}
          >
            <ToggleSwitch
              label={'Inclure dans la DAI ?'}
              checked={inDai}
              labelPosition={'left'}
              onChange={() => {
                onToggleInDai(!inDai);
              }}
            />
            {inDai && (
              <ToggleSwitch
                label={'Optionnel ?'}
                checked={optional}
                labelPosition={'left'}
                onChange={() => {
                  onToggleOptional(!optional);
                }}
              />
            )}
            {inDai && (
              <AppSearchInput
                label={'Sigle Sacha'}
                options={options}
                value={selectedSigle ?? ''}
                onSelect={(value) => onSelectSigle(value as CommemoratifSigle)}
                placeholder="Rechercher un sigle"
                className={clsx(cx('fr-ml-auto', 'fr-mb-0'))}
                required={true}
                state={selectedSigle ? 'default' : 'error'}
              />
            )}
          </div>
        </div>
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
                fieldConfig={fieldConfig}
                selectedCommemoratif={sachaCommemoratifs[selectedSigle]}
                selectedValue={selectedValues[optionValue] ?? ''}
                optional={optional}
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
  fieldConfig: SachaFieldConfig;
  selectedCommemoratif: SachaCommemoratifRecord[CommemoratifSigle] | null;
  optional: boolean;
  selectedValue: string | null;
  onSelectValue: (valueSigle?: string) => void;
}

const OptionValueLine = ({
  optionValue,
  fieldConfig,
  selectedCommemoratif,
  selectedValue,
  optional,
  onSelectValue
}: OptionValueLineProps) => {
  const optionLabel =
    fieldConfig.options.find((o) => o.value === optionValue)?.label ??
    optionValue;

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
      required={!optional}
      state={selectedValue || optional ? 'default' : 'error'}
    />
  );
};
