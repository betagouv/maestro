import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { LocalPrescriptionUpdate } from '../LocalPrescription/LocalPrescription';
import { Prescription } from './Prescription';

export const PrescriptionSampleCountUpdate = z.object({
  prescriptionId: z.guid(),
  programmingPlanId: z.guid(),
  ...Prescription.pick({ sampleCount: true }).shape
});

export const ScopedLocalPrescriptionUpdate = z.object({
  prescriptionId: z.guid(),
  region: Region,
  department: Department.nullish(),
  update: LocalPrescriptionUpdate
});

export const PrescriptionSaveRequest = z.object({
  prescriptionUpdates: z.array(PrescriptionSampleCountUpdate),
  localPrescriptionUpdates: z.array(ScopedLocalPrescriptionUpdate)
});

export const PrescriptionSaveResult = z.object({
  prescriptionCount: z.number().int(),
  localPrescriptionCount: z.number().int()
});

export type PrescriptionSampleCountUpdate = z.infer<
  typeof PrescriptionSampleCountUpdate
>;
export type ScopedLocalPrescriptionUpdate = z.infer<
  typeof ScopedLocalPrescriptionUpdate
>;
export type PrescriptionSaveRequest = z.infer<typeof PrescriptionSaveRequest>;
export type PrescriptionSaveResult = z.infer<typeof PrescriptionSaveResult>;
