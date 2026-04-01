import { FieldInputType } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { UnknownValueLabel } from 'maestro-shared/schema/SpecificData/SpecificData';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';

export const FieldInputTypeLabels: Record<FieldInputType, string> = {
  text: 'Texte court',
  number: 'Nombre',
  textarea: 'Texte long',
  select: 'Liste',
  selectWithUnknown: `Liste avec "${UnknownValueLabel}"`,
  checkbox: 'Case à cocher',
  radio: 'Bouton radio'
};

export const fieldInputTypeOptions = selectOptionsFromList(
  FieldInputType.options,
  { labels: FieldInputTypeLabels }
);

export const fieldInputTypeOptionsWithDefault = selectOptionsFromList(
  FieldInputType.options,
  {
    labels: FieldInputTypeLabels,
    withDefault: true,
    defaultLabel: 'Sélectionner un type'
  }
);
