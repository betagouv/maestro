import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  AdminFieldConfig,
  CreateFieldInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { FieldInputType } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import React, { useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';
import { fieldInputTypeOptionsWithDefault } from './fieldInputTypeLabels';

interface Props {
  onCreated: (field: AdminFieldConfig) => void;
}

type FormData = {
  key: string;
  inputType: string;
  label: string;
  hintText: string;
};

const defaultFormData: FormData = {
  key: '',
  inputType: '',
  label: '',
  hintText: ''
};

export const FieldCreateForm = ({ onCreated, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [createField, createFieldResult] = apiClient.useCreateFieldMutation();

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const form = useForm(CreateFieldInput, {
    key: formData.key,
    inputType: formData.inputType as FieldInputType,
    label: formData.label,
    hintText: formData.hintText || undefined
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async (valid) => {
      try {
        const created = await createField(valid).unwrap();
        onCreated(created);
      } catch (_err) {
        /* empty */
      }
    });
  };

  return (
    <form className={clsx('white-container', cx('fr-px-10w', 'fr-py-8w'))}>
      <AppTextInput
        label="Clé"
        value={formData.key}
        inputForm={form}
        inputKey="key"
        onChange={(e) => setFormData((d) => ({ ...d, key: e.target.value }))}
        required
      />
      <AppSelect
        label="Type de saisie"
        value={formData.inputType}
        inputForm={form}
        inputKey="inputType"
        options={fieldInputTypeOptionsWithDefault}
        onChange={(e) =>
          setFormData((d) => ({ ...d, inputType: e.target.value }))
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
      <AppServiceErrorAlert call={createFieldResult} />
      <Button priority="primary" onClick={submit}>
        Créer le champ
      </Button>
    </form>
  );
};
