import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  FoieDeBovinLocalPrescriptionFixture,
  FoieDeBovinPrescriptionFixture,
  FoieDeBovinValidatedLocalPrescriptionFixture,
  FoieDeBovinValidatedPrescriptionFixture,
  VolailleLocalPrescriptionFixture,
  VolaillePrescriptionFixture,
  VolailleValidatedLocalPrescriptionFixture,
  VolailleValidatedPrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { LocalPrescriptions } from '../../../repositories/localPrescriptionRepository';
import { LocalPrescriptionSubstanceKindsLaboratories } from '../../../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { AVIVOL, CHARAL } from './001-companies';
import {
  DAOABovinMultiLaboratoryIds,
  DAOACopperLaboratoryIds,
  DAOAMonoLaboratoryIds,
  DAOAVolailleMultiLaboratoryIds
} from './008-laboratory-agreements';

export const seed = async () => {
  await Prescriptions().insert([
    FoieDeBovinPrescriptionFixture,
    VolaillePrescriptionFixture,
    FoieDeBovinValidatedPrescriptionFixture,
    VolailleValidatedPrescriptionFixture
  ]);

  await LocalPrescriptions().insert([
    ...FoieDeBovinLocalPrescriptionFixture,
    ...VolailleLocalPrescriptionFixture,
    ...FoieDeBovinValidatedLocalPrescriptionFixture,
    ...VolailleValidatedLocalPrescriptionFixture
  ]);

  await LocalPrescriptions()
    .where('prescription_id', FoieDeBovinValidatedPrescriptionFixture.id)
    .andWhere('department', '85')
    .andWhere('companySiret', 'None')
    .update({ sampleCount: 5 });

  await LocalPrescriptions().insert({
    prescriptionId: FoieDeBovinValidatedPrescriptionFixture.id,
    region: '52' as const,
    department: '85' as const,
    companySiret: CHARAL.siret,
    sampleCount: 5
  });

  await LocalPrescriptions()
    .where('prescription_id', VolailleValidatedPrescriptionFixture.id)
    .andWhere('department', '85')
    .andWhere('companySiret', 'None')
    .update({ sampleCount: 3 });

  await LocalPrescriptions().insert({
    prescriptionId: VolailleValidatedPrescriptionFixture.id,
    region: '52' as const,
    department: '85' as const,
    companySiret: AVIVOL.siret,
    sampleCount: 3
  });

  await LocalPrescriptionSubstanceKindsLaboratories().insert(
    [
      FoieDeBovinValidatedPrescriptionFixture,
      VolailleValidatedPrescriptionFixture
    ].flatMap((prescription) =>
      RegionList.flatMap((region) =>
        Regions[region].departments.flatMap((department) => [
          {
            prescriptionId: prescription.id,
            region,
            department,
            substanceKind: 'Mono',
            laboratoryId: oneOf(DAOAMonoLaboratoryIds)
          },
          {
            prescriptionId: prescription.id,
            region,
            department,
            substanceKind: 'Multi',
            laboratoryId: oneOf(
              prescription.programmingPlanKind === 'DAOA_BOVIN'
                ? DAOABovinMultiLaboratoryIds
                : DAOAVolailleMultiLaboratoryIds
            )
          },
          {
            prescriptionId: prescription.id,
            region,
            department,
            substanceKind: 'Copper',
            laboratoryId: oneOf(DAOACopperLaboratoryIds)
          }
        ])
      )
    )
  );
};
