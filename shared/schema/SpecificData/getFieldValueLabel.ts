import { isNil } from 'lodash-es';
import {
  UnknownValue,
  UnknownValueLabel
} from '../Sample/SampleMatrixSpecificData';
import { FieldConfig } from './PlanKindFieldConfig';

export const getFieldValueLabel = (
  field: FieldConfig,
  rawValue: unknown
): string | null => {
  if (isNil(rawValue)) {
    return null;
  }

  const sortedOptions = [...field.options].sort((a, b) => a.order - b.order);

  switch (field.inputType) {
    case 'checkbox':
      return rawValue ? field.label : null;
    case 'select':
    case 'radio':
      return (
        sortedOptions.find((o) => o.value === rawValue)?.label ||
        String(rawValue)
      );
    case 'selectWithUnknown':
      if (rawValue === UnknownValue) return UnknownValueLabel;
      return (
        sortedOptions.find((o) => o.value === rawValue)?.label ||
        String(rawValue)
      );
    case 'text':
    case 'number':
    case 'textarea':
      return String(rawValue);
    default:
      return String(rawValue);
  }
};
