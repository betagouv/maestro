import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import type { CommemoratifSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  FieldInputType,
  fieldInputTypeHasOptions
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type React from 'react';
import { useContext, useEffect, useState } from 'react';
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

  const [formData, setFormData] = useState<FormData>({
    inputType: field.inputType,
    label: field.label,
    hintText: field.hintText ?? ''
  });

  const [optional, setOptional] = useState<boolean>(field.sachaOptional);
  const [selectedSigle, setSelectedSigle] = useState<CommemoratifSigle | null>(
    field.sachaCommemoratifSigle
  );

  useEffect(() => {
    setFormData({
      inputType: field.inputType,
      label: field.label,
      hintText: field.hintText ?? ''
    });
    setOptional(field.sachaOptional);
    setSelectedSigle(field.sachaCommemoratifSigle);
  }, [field.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
          inputType: valid.inputType,
          label: valid.label,
          hintText: valid.hintText ?? null
        }).unwrap();
        await updateSampleSpecificDataAttribute({
          attribute: field.key,
          sachaCommemoratifSigle: selectedSigle,
          optional
        });
      } catch (_err) {
        /* empty */
      }
    });
  };

  const sigleOptions = sachaCommemoratifs
    ? Object.values(sachaCommemoratifs)
        .filter((c) => {
          if (
            formData.inputType === 'number' ||
            formData.inputType === 'decimal'
          )
            return c.typeDonnee === 'numeric';
          if (
            formData.inputType === 'textarea' ||
            formData.inputType === 'text'
          )
            return c.typeDonnee === 'text';
          if (formData.inputType === 'date') return c.typeDonnee === 'date';
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
      {sachaCommemoratifs && (
        <fieldset
          className={cx('fr-fieldset', 'fr-mt-2w')}
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
              <AppSearchInput
                label="Sigle Sacha"
                options={sigleOptions}
                value={selectedSigle ?? ''}
                onSelect={(value) =>
                  setSelectedSigle((value as CommemoratifSigle) || null)
                }
                placeholder="Rechercher un sigle"
                className={clsx(cx('fr-mb-0'))}
              />
              {selectedSigle && (
                <ToggleSwitch
                  label="Optionnel ?"
                  checked={optional}
                  labelPosition="left"
                  onChange={() => setOptional((v) => !v)}
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
