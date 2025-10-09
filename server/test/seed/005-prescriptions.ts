import { omit } from 'lodash-es';
import {
  LocalPrescriptionFixture,
  PrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import {
  formatLocalPrescription,
  LocalPrescriptions
} from '../../repositories/localPrescriptionRepository';
import { LocalPrescriptionSubstancesLaboratories } from '../../repositories/localPrescriptionSubstanceLaboratoryRepository';
import { Prescriptions } from '../../repositories/prescriptionRepository';

export const seed = async (): Promise<void> => {
  await Prescriptions().insert(PrescriptionFixture);

  await LocalPrescriptions().insert(
    [LocalPrescriptionFixture].map((_) =>
      omit(formatLocalPrescription(_), [
        'substancesLaboratories',
        'realizedSampleCount',
        'inProgressSampleCount'
      ])
    )
  );

  await LocalPrescriptionSubstancesLaboratories().insert(
    [LocalPrescriptionFixture].flatMap((localPrescription) =>
      (localPrescription.substancesLaboratories ?? []).map(
        (substanceLaboratory) => ({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: localPrescription.department ?? 'None',
          substance: substanceLaboratory.substance,
          laboratoryId: substanceLaboratory.laboratoryId
        })
      )
    )
  );
};
