import Button from '@codegouvfr/react-dsfr/Button';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { CommemoratifSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  FieldInputType,
  fieldInputTypeHasOptions
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import React, { useContext, useEffect, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import z from 'zod';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSearchInput from '../../../components/_app/AppSearchInput/AppSearchInput';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';
import { fieldInputTypeOptions } from './fieldInputTypeLabels';

const FieldFormSchema = z.object({
  inputType: FieldInputType,
  label: z.string().min(1),
  hintText: z.string().optional()
});

type FormData = {
  inputType: FieldInputType;
  label: string;
  hintText: string;
};

interface Props {
  field: AdminFieldConfig;
}

export const FieldForm = ({ field, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [updateField, updateFieldResult] = apiClient.useUpdateFieldMutation();
  const [updateSampleSpecificDataAttribute] =
    apiClient.useUpdateSampleSpecificDataAttributeMutation();

  const { data: sachaCommemoratifs } =
    apiClient.useGetSachaCommemoratifsQuery();
  const { data: sachaFields = [] } = apiClient.useFindSachaFieldConfigsQuery();
  const sachaField = sachaFields.find((f) => f.key === field.key) ?? null;

  const [formData, setFormData] = useState<FormData>({
    inputType: field.inputType,
    label: field.label,
    hintText: field.hintText ?? ''
  });

  const [inDai, setInDai] = useState<boolean>(sachaField?.inDai ?? false);
  const [optional, setOptional] = useState<boolean>(
    sachaField?.optional ?? false
  );
  const [selectedSigle, setSelectedSigle] = useState<CommemoratifSigle | null>(
    sachaField?.sachaCommemoratifSigle ?? null
  );

  useEffect(() => {
    setFormData({
      inputType: field.inputType,
      label: field.label,
      hintText: field.hintText ?? ''
    });
  }, [field.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setInDai(sachaField?.inDai ?? false);
    setOptional(sachaField?.optional ?? false);
    setSelectedSigle(sachaField?.sachaCommemoratifSigle ?? null);
  }, [sachaField?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const form = useForm(FieldFormSchema, {
    inputType: formData.inputType as FieldInputType,
    label: formData.label,
    hintText: formData.hintText || undefined
  });

  const submit = async (_e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (valid) => {
      try {
        await updateField({
          fieldId: field.id,
          body: {
            inputType: valid.inputType,
            label: valid.label,
            hintText: valid.hintText ?? null
          }
        }).unwrap();
        if (sachaField) {
          await updateSampleSpecificDataAttribute({
            attribute: field.key,
            sachaCommemoratifSigle: selectedSigle,
            inDai,
            optional
          });
        }
      } catch (_err) {
        /* empty */
      }
    });
  };

  const sigleOptions = sachaCommemoratifs
    ? Object.values(sachaCommemoratifs)
        .filter((c) => {
          if (formData.inputType === 'number')
            return c.typeDonnee === 'numeric';
          if (
            formData.inputType === 'textarea' ||
            formData.inputType === 'text'
          )
            return c.typeDonnee === 'text';
          if (fieldInputTypeHasOptions(formData.inputType))
            return c.typeDonnee === 'list';
          return false;
        })
        .map((c) => ({ label: `${c.libelle} (${c.sigle})`, value: c.sigle }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  return (
    <section className={cx('fr-mb-6w')}>
      <h3>Propriétés du champ</h3>
      <AppSelect
        label="Type de saisie"
        value={formData.inputType}
        inputForm={form}
        inputKey="inputType"
        options={fieldInputTypeOptions}
        onChange={(e) =>
          setFormData((d) => ({
            ...d,
            inputType: e.target.value as FieldInputType
          }))
        }
        required
      />
      <AppTextInput
        label="Libellé"
        value={formData.label}
        inputForm={form}
        inputKey="label"
        onChange={(e) => setFormData((d) => ({ ...d, label: e.target.value }))}
        required
      />
      <AppTextInput
        label="Texte d'aide"
        value={formData.hintText}
        inputForm={form}
        inputKey="hintText"
        onChange={(e) =>
          setFormData((d) => ({ ...d, hintText: e.target.value }))
        }
      />
      {sachaField && sachaCommemoratifs && (
        <fieldset
          className={cx('fr-fieldset', 'fr-mt-2w')}
          role="group"
          aria-labelledby="sacha-fieldset-legend"
        >
          <legend
            className={cx('fr-fieldset__legend')}
            id="sacha-fieldset-legend"
          >
            Configuration Sacha (DAI)
          </legend>
          <div className={cx('fr-fieldset__element')} style={{ width: '100%' }}>
            <div className={clsx('d-flex-row', 'd-flex-align-center')}>
              <ToggleSwitch
                label="Inclure dans la DAI ?"
                checked={inDai}
                labelPosition="left"
                onChange={() => setInDai((v) => !v)}
              />
              {inDai && (
                <ToggleSwitch
                  label="Optionnel ?"
                  checked={optional}
                  labelPosition="left"
                  onChange={() => setOptional((v) => !v)}
                />
              )}
              {inDai && (
                <AppSearchInput
                  label="Sigle Sacha"
                  options={sigleOptions}
                  value={selectedSigle ?? ''}
                  onSelect={(value) =>
                    setSelectedSigle((value as CommemoratifSigle) || null)
                  }
                  placeholder="Rechercher un sigle"
                  className={clsx(cx('fr-ml-4w', 'fr-mb-0'))}
                  required={true}
                  state={selectedSigle ? 'default' : 'error'}
                />
              )}
            </div>
          </div>
        </fieldset>
      )}
      <AppServiceErrorAlert call={updateFieldResult} />
      <Button priority="primary" onClick={submit} className={cx('fr-mt-2w')}>
        Enregistrer
      </Button>
    </section>
  );
};
