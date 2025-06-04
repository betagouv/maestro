import z from 'zod/v4';
export const OptionalBoolean = z.enum(['true', 'false', 'NA'], {
  error: () => 'Veuillez renseigner une valeur.'
});

export type OptionalBoolean = z.infer<typeof OptionalBoolean>;

export const OptionalBooleanList: OptionalBoolean[] = OptionalBoolean.options;

export const OptionalBooleanLabels: Record<OptionalBoolean, string> = {
  true: 'Oui',
  false: 'Non',
  NA: 'Sans objet'
};
