import { z } from 'zod';

export const laboratoryNames = ['LDA 72', 'GIR 49'] as const satisfies string[]
export const laboratoryNameValidator = z.enum(laboratoryNames)
export type LaboratoryName = z.infer<typeof laboratoryNameValidator>
