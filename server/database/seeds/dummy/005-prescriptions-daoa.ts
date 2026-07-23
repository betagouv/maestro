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
import { DAOABovinValidatedSubPlanId } from 'maestro-shared/test/programmingPlanFixtures';
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
    // Foie de bovin's national sampleCount is left unset here (seed-only override,
    // fixture itself keeps 80) so the "InProgress" DAOA plan's national completeness
    // stays false, matching its "InProgress" (not ready to send) status.
    { ...FoieDeBovinPrescriptionFixture, sampleCount: 0 },
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

  // The fixtures above zero-fill every department's row (only the region-level
  // aggregate carries a real count) so that the "InProgress" DAOA demo plan looks
  // genuinely mid-distribution. The "Validated" plan is meant to look fully done
  // at every echelon, so its department-level counts need to be real here too —
  // split each region's fixture total across its departments, at least 1 each.
  const regionQuantities: Record<string, number[]> = {
    [FoieDeBovinValidatedPrescriptionFixture.id]: [
      3, 2, 5, 8, 10, 1, 2, 10, 3, 3, 2, 9, 4, 4, 2, 1, 5, 6
    ],
    [VolailleValidatedPrescriptionFixture.id]: [
      2, 3, 8, 1, 9, 1, 11, 3, 2, 1, 1, 4, 6, 1, 5, 6, 3, 10
    ]
  };

  for (const prescriptionId of Object.keys(regionQuantities)) {
    await Promise.all(
      RegionList.flatMap((region, regionIndex) => {
        const departments = Regions[region].departments;
        const regionTotal = regionQuantities[prescriptionId][regionIndex];
        const base = Math.floor(regionTotal / departments.length);
        const remainder = regionTotal % departments.length;
        return departments.map((department, departmentIndex) =>
          LocalPrescriptions()
            .where({ prescriptionId, region, department })
            .andWhere('companySiret', 'None')
            .update({
              sampleCount: Math.max(
                base + (departmentIndex < remainder ? 1 : 0),
                1
              )
            })
        );
      })
    );
  }

  await LocalPrescriptions().insert({
    prescriptionId: FoieDeBovinValidatedPrescriptionFixture.id,
    region: '52' as const,
    department: '85' as const,
    companySiret: CHARAL.siret,
    sampleCount: 5
  });

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
              prescription.programmingSubPlanId === DAOABovinValidatedSubPlanId
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
