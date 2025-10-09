import { omit } from 'lodash-es';
import {
  LocalPrescriptionFixture,
  PrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import {
  formatLocalPrescription,
  LocalPrescriptions
} from '../../repositories/localPrescriptionRepository';
import { LocalPrescriptionSubstanceKindsLaboratories } from '../../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';

export const seed = async (): Promise<void> => {
  await Prescriptions().insert(PrescriptionFixture);

  await LocalPrescriptions().insert(
    [LocalPrescriptionFixture].map((_) =>
      omit(formatLocalPrescription(_), [
        'substanceKindsLaboratories',
        'realizedSampleCount',
        'inProgressSampleCount'
      ])
    )
  );

  await LocalPrescriptionSubstanceKindsLaboratories().insert(
    [LocalPrescriptionFixture].flatMap((localPrescription) =>
      (localPrescription.substanceKindsLaboratories ?? []).map(
        (substanceKindLaboratory) => ({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: localPrescription.department ?? 'None',
          substanceKind: substanceKindLaboratory.substanceKind,
          laboratoryId: substanceKindLaboratory.laboratoryId
        })
      )
    )
  );
};
