import { z, ZodTypeAny } from 'zod';
import { assertUnreachable } from '../../utils/typescript';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UnknownValue } from '../Sample/SampleMatrixSpecificData';
import { PlanKindFieldConfig } from './PlanKindFieldConfig';

export const buildSpecificDataSchema = (
  planKind: ProgrammingPlanKind,
  fieldConfigs: PlanKindFieldConfig[]
): z.ZodObject<Record<string, ZodTypeAny>> => {
  const shape: Record<string, ZodTypeAny> = {
    programmingPlanKind: z.literal(planKind)
  };

  for (const { field, required } of fieldConfigs) {
    const optionValues = field.options.map((o) => o.value);
    const errMsg = `Veuillez renseigner le champ « ${field.label} ».`;

    let fieldSchema: ZodTypeAny;

    switch (field.inputType) {
      case 'text':
      case 'textarea':
        fieldSchema = required
          ? z
              .string({
                error: (issue) => (issue.input == null ? errMsg : issue.message)
              })
              .min(1, errMsg)
          : z.string().nullish();
        break;

      case 'number':
        fieldSchema = required
          ? z.coerce.number({ error: errMsg }).int().nonnegative()
          : z.coerce.number().int().nonnegative().nullish();
        break;

      case 'select':
        if (optionValues.length > 0) {
          const enumSchema = z.enum(optionValues as [string, ...string[]], {
            error: () => errMsg
          });
          fieldSchema = required ? enumSchema : enumSchema.nullish();
        } else {
          fieldSchema = required
            ? z
                .string({
                  error: (issue) =>
                    issue.input == null ? errMsg : issue.message
                })
                .min(1, errMsg)
            : z.string().nullish();
        }
        break;

      case 'selectWithUnknown': {
        const allValues = [...optionValues, UnknownValue] as unknown as [
          string,
          ...string[]
        ];
        fieldSchema = z.enum(allValues, { error: () => errMsg });
        break;
      }

      case 'radio': {
        if (optionValues.length > 0) {
          const enumSchema = z.enum(optionValues as [string, ...string[]], {
            error: () => errMsg
          });
          fieldSchema = required ? enumSchema : enumSchema.nullish();
        } else {
          fieldSchema = z.string().nullish();
        }
        break;
      }

      case 'checkbox':
        fieldSchema = z.boolean().nullish();
        break;

      default:
        fieldSchema = assertUnreachable(field.inputType);
    }

    shape[field.key] = fieldSchema;
  }

  return z.object(shape);
};
