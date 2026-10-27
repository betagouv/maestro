import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  ALANRuminantsSubPlanId,
  ALANVolaillesSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { LocalPrescriptions } from '../../../repositories/localPrescriptionRepository';
import { Prescriptions } from '../../../repositories/prescriptionRepository';

const RuminantsPrescriptionId = 'e1c3a7d4-2b58-4f16-9a7c-3d8e5f0b1a62';
const VolaillesPrescriptionId = 'f2d4b8e5-3c69-4a27-8b6d-4e9f6a1c2b73';

const regionQuantities: Record<string, number[]> = {
  [RuminantsPrescriptionId]: [
    5, 4, 6, 3, 8, 2, 7, 6, 4, 5, 3, 9, 4, 5, 6, 4, 3, 6
  ],
  [VolaillesPrescriptionId]: [
    3, 2, 4, 2, 5, 1, 5, 4, 3, 3, 2, 6, 3, 3, 4, 3, 2, 5
  ]
};

export const seed = async () => {
  await Prescriptions().insert([
    {
      id: RuminantsPrescriptionId,
      programmingSubPlanId: ALANRuminantsSubPlanId,
      sampleCount: 90
    },
    {
      id: VolaillesPrescriptionId,
      programmingSubPlanId: ALANVolaillesSubPlanId,
      sampleCount: 60
    }
  ]);

  await LocalPrescriptions().insert(
    Object.entries(regionQuantities).flatMap(([prescriptionId, quantities]) =>
      RegionList.flatMap((region, regionIndex) => {
        const departments = Regions[region].departments;
        const regionTotal = quantities[regionIndex];
        const base = Math.floor(regionTotal / departments.length);
        const remainder = regionTotal % departments.length;

        return [
          {
            prescriptionId,
            region,
            sampleCount: regionTotal
          },
          ...departments.map((department, departmentIndex) => ({
            prescriptionId,
            region,
            department,
            sampleCount: base + (departmentIndex < remainder ? 1 : 0)
          }))
        ];
      })
    )
  );
};
